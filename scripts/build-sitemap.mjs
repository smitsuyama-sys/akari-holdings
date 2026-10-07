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

const pages = readdirSync('.')
  .filter(f => f.endsWith('.html') && f !== '404.html' && !/^google[0-9a-f]+\.html$/.test(f))
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
  `User-agent: *\nAllow: /\nDisallow: /ops/\nDisallow: /netlify/\nDisallow: /scripts/\nDisallow: /wallpaper/\n\nSitemap: ${site}/sitemap.xml\n`);

console.log(`sitemap.xml: ${pages.length} pages for ${site}`);
