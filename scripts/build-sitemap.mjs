// デプロイ時に sitemap.xml と robots.txt を生成する（Netlify の build command から実行）
// サイトのURLは Netlify が渡す環境変数 URL を使うため、独自ドメインに切り替えると自動で追従する。
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const DEFAULT_ORIGIN = 'https://akari-holdings.netlify.app';

const site = (process.env.URL || DEFAULT_ORIGIN).replace(/\/$/, '');

const priority = name =>
  name === 'index.html' ? '1.0' :
  name === 'shindan.html' ? '0.9' :
  /^column/.test(name) || /^business/.test(name) ? '0.8' : '0.6';

// 独自ドメインに切り替えたら、共有用タグ（og:url / og:image / canonical）のURLも置き換える
const htmlFiles = readdirSync('.').filter(f => f.endsWith('.html'));
if (site !== DEFAULT_ORIGIN) {
  for (const f of htmlFiles) {
    const html = readFileSync(f, 'utf8');
    const next = html.replace(/(<meta property="og:(?:url|image)" content="|<link rel="canonical" href=")https:\/\/akari-holdings\.netlify\.app/g, `$1${site}`);
    if (next !== html) writeFileSync(f, next);
  }
}

// トップページの「新着コラム」を、column.html の一覧の新しい3件で自動更新する。
// 毎日のコラム自動公開は column.html に1件追加するだけなので、トップにもデプロイ時に反映される。
{
  const list = readFileSync('column.html', 'utf8');
  const from = list.indexOf('COLUMN-LIST:START');
  const items = from < 0 ? [] : (list.slice(from).match(/<li class="news-item">[\s\S]*?<\/li>/g) || []).slice(0, 3);
  const index = readFileSync('index.html', 'utf8');
  const re = /(<!-- LATEST-COLUMNS:START[^>]*-->\n)[\s\S]*?(<!-- LATEST-COLUMNS:END -->)/;
  if (items.length && re.test(index)) {
    writeFileSync('index.html', index.replace(re, (_, a, b) => a + items.map(i => '      ' + i).join('\n') + '\n' + b));
  }
}

// 検索エンジン向けの構造化データ（JSON-LD）を各ページに差し込む。
// 会社情報・パンくず・記事情報を Google に正しく伝え、社名検索や記事の表示を助ける。
// 毎日追加されるコラムにも、デプロイのたびに自動で付く。
const ORG = {
  '@type': 'Organization',
  '@id': `${site}/#organization`,
  name: '光（あかり）ホールディングス株式会社',
  alternateName: ['光ホールディングス株式会社', '光ホールディングス', 'あかりホールディングス', 'AKARI HOLDINGS'],
  url: `${site}/`,
  logo: `${site}/assets/logo-512.png`,
  foundingDate: '2023-10-23',
  founder: { '@type': 'Person', name: '光山 聡', jobTitle: '代表取締役社長' },
  address: {
    '@type': 'PostalAddress', postalCode: '810-0022', addressCountry: 'JP',
    addressRegion: '福岡県', addressLocality: '福岡市中央区', streetAddress: '薬院4丁目13-62'
  },
  areaServed: '日本',
  knowsAbout: ['事業承継', 'M&A', 'MBO', 'LBO', 'M&Aセカンドオピニオン', 'グループ経営']
};
const SECTION = [
  [/^business-/, '事業内容', 'business.html'],
  [/^column-/, 'コラム', 'column.html'],
  [/^news-/, 'お知らせ', 'news.html']
];
const text = s => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const urlOf = f => f === 'index.html' ? `${site}/` : `${site}/${f}`;

for (const f of htmlFiles) {
  if (f === '404.html' || f === 'report.html' || /^google[0-9a-f]+\.html$/.test(f)) continue;
  let html = readFileSync(f, 'utf8');
  if (html.includes('data-jsonld')) continue;
  const graph = [];
  if (f === 'index.html') {
    graph.push(ORG, { '@type': 'WebSite', '@id': `${site}/#website`, url: `${site}/`, name: ORG.name, inLanguage: 'ja', publisher: { '@id': ORG['@id'] } });
  } else {
    const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1];
    if (!h1) continue;
    const name = text(h1);
    const items = [{ name: 'ホーム', item: `${site}/` }];
    const sec = SECTION.find(([re]) => re.test(f));
    if (sec) items.push({ name: sec[1], item: urlOf(sec[2]) });
    items.push({ name, item: urlOf(f) });
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: items.map((x, i) => ({ '@type': 'ListItem', position: i + 1, ...x }))
    });
    const date = (html.match(/<time datetime="(\d{4}-\d{2}-\d{2})"/) || [])[1];
    if (/^(column|news)-/.test(f) && date) {
      const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
      graph.push({
        '@type': /^column-/.test(f) ? 'Article' : 'NewsArticle',
        headline: name, description: desc, datePublished: date, dateModified: date,
        mainEntityOfPage: urlOf(f), image: `${site}/assets/og-image.png`, inLanguage: 'ja',
        author: { '@type': 'Organization', name: ORG.name, url: `${site}/` },
        publisher: { '@id': ORG['@id'], '@type': 'Organization', name: ORG.name, logo: { '@type': 'ImageObject', url: ORG.logo } }
      });
    }
  }
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
  html = html.replace('</head>', `<script type="application/ld+json" data-jsonld>${json}</script>\n</head>`);
  writeFileSync(f, html);
}

const pages = readdirSync('.')
  .filter(f => f.endsWith('.html') && f !== '404.html' && f !== 'report.html' && !/^google[0-9a-f]+\.html$/.test(f))
  .sort()
  .map(f => {
    const html = readFileSync(f, 'utf8');
    // コラム・お知らせは記事の日付を更新日として使う
    const m = /^(column|news)-/.test(f) && html.match(/<time datetime="(\d{4}-\d{2}-\d{2})"/);
    const loc = f === 'index.html' ? `${site}/` : `${site}/${f}`;
    return `  <url><loc>${loc}</loc>${m ? `<lastmod>${m[1]}</lastmod>` : ''}<priority>${priority(f)}</priority></url>`;
  });

writeFileSync('sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.join('\n')}\n</urlset>\n`);

writeFileSync('robots.txt',
  `User-agent: *\nAllow: /\nDisallow: /ops/\nDisallow: /netlify/\nDisallow: /scripts/\nDisallow: /wallpaper/\nDisallow: /report.html\nDisallow: /api/\n\nSitemap: ${site}/sitemap.xml\n`);

console.log(`sitemap.xml: ${pages.length} pages for ${site}`);
