// 詳細レポートの共通処理（章の定義・AIでの作成・保存・メール送信）
//
// 環境変数（Netlify の Site configuration → Environment variables で設定）
//   ANTHROPIC_API_KEY  AIで章を書く。未設定なら定型の文章で章を作る
//   RESEND_API_KEY / MAIL_FROM  設定するとメールを送る
//   STAFF_EMAIL        担当者の通知先
//   REPLY_TO           利用者がメールに返信したときの宛先（未設定なら STAFF_EMAIL）
//   BOOKING_URL        面談予約ページのURL（任意）
//   AI_TIMEOUT_MS      AIの待ち時間（ミリ秒、既定 25000）
import Anthropic from '@anthropic-ai/sdk';
import { getStore } from '@netlify/blobs';
import {
  QUESTIONS, EXTRA_QUESTIONS, SERVICES, scoreAnswers, ruleReport, labelOf, labelOfExtra, dimensions, sanitize
} from '../../assets/shindan-core.mjs';

export const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export const store = () => getStore({ name: 'reports', consistency: 'strong' });

export const isId = id => typeof id === 'string' && /^[0-9a-f-]{36}$/.test(id);

// ---------- 回答を文章にまとめる（AIへの入力） ----------
export function profileText(meta) {
  const { answers: a, extra: x, contact } = meta;
  const lines = [
    `会社名：${contact.company}`,
    ...QUESTIONS.map(q => `${q.title} → ${labelOf(q.id, a[q.id]) || '未回答'}`),
    ...EXTRA_QUESTIONS.map(q => `${q.title} → ${labelOfExtra(q.id, x[q.id]) || '未回答'}`),
    '観点別のスコア（0〜100、高いほど承継に向けて整っている）：' +
      meta.dims.map(d => `${d.label} ${d.score}`).join('／'),
    `承継の準備度：${meta.score.readiness}／早めに動くべき度合い：${meta.score.urgency}`,
    `当社がおすすめする支援：${SERVICES[meta.score.service].name}`
  ];
  return lines.join('\n');
}

const SYSTEM = `あなたは光（あかり）ホールディングス株式会社で、中小企業の事業承継・M&Aを支援するシニアコンサルタントです。
同社は事業承継・M&A（譲受）、MBO支援、経営支援、M&Aセカンドオピニオンを提供しています。
経営者が答えた診断の回答をもとに、有料のコンサルティングレポートに匹敵する、具体的で実務的な個別レポートの一章を書きます。

守ること:
- 回答内容（業種、規模、後継者、財務、株主構成、個人保証、取引先、社長への依存度、大切にしたいこと）に必ず具体的に触れる。一般論だけで終わらせない
- 経営者が読んで分かる平易な日本語。専門用語は短く言い換える
- 企業価値・株価・譲渡価格・税額などの具体的な金額や倍率は書かない。統計や法令の条文番号も書かない（根拠を示せないため）
- 「必ず」「確実に」など成果を保証する表現や、不安をあおる表現を使わない
- 税務・法務は論点の整理にとどめ、最終判断は専門家への確認が必要であることを前提にする
- 指定されたJSONの形式だけで出力する`;

const str = { type: 'string' };
const strArr = { type: 'array', items: str };
const obj = (properties) => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });
const level = { type: 'string', enum: ['高', '中', '低'] };

export const SECTIONS = [
  {
    id: 'summary', title: '1. 現状診断',
    instruction: `「現状診断」の章を書いてください。
- headline: この会社の現状をひとことで表す見出し（40字以内）
- overview: 現状の総評（300〜450字、2〜3段落を改行2つで区切る）
- strengths: 承継に向けた強み（3〜4個、各40〜80字）
- concerns: 優先して向き合うべき課題（3〜4個、各40〜80字）`,
    schema: obj({ headline: str, overview: str, strengths: strArr, concerns: strArr })
  },
  {
    id: 'options', title: '2. 承継の選択肢の比較',
    instruction: `「承継の選択肢の比較」の章を書いてください。
- rows: 親族内承継、社内承継（MBO・EBO）、第三者への譲渡（M&A）の3行。それぞれ
  fit（この会社への適合度：高/中/低）、reason（そう判断した理由、80〜140字）、issues（進める場合の主な論点、80〜140字）
- recommendation: 回答を踏まえた、検討の進め方の提案（200〜320字）`,
    schema: obj({
      rows: { type: 'array', items: obj({ option: { type: 'string', enum: ['親族内承継', '社内承継（MBO・EBO）', '第三者への譲渡（M&A）'] }, fit: level, reason: str, issues: str }) },
      recommendation: str
    })
  },
  {
    id: 'risks', title: '3. リスクと論点',
    instruction: `「リスクと論点」の章を書いてください。
- items: この会社が承継を進めるうえで注意すべきリスク・論点（4〜6個）。それぞれ
  title（20字以内）、detail（なぜ問題になるか・どう備えるか、100〜180字）、priority（優先度：高/中/低）
  回答に関係するもの（個人保証、株主の分散、特定取引先への依存、社長への依存、財務など）を優先する`,
    schema: obj({ items: { type: 'array', items: obj({ title: str, detail: str, priority: level }) } })
  },
  {
    id: 'value', title: '4. 企業価値を高めるために',
    instruction: `「企業価値を高めるために」の章を書いてください。金額は書かないこと。
- intro: 企業価値の考え方と、この会社で評価されやすい点・見られやすい点（150〜250字）
- items: 承継の前に取り組むと価値や選択肢が広がる取り組み（4〜5個）。それぞれ title（20字以内）、detail（具体的な進め方、100〜180字）`,
    schema: obj({ intro: str, items: { type: 'array', items: obj({ title: str, detail: str }) } })
  },
  {
    id: 'plan', title: '5. これからの行動計画',
    instruction: `「これからの行動計画」の章を書いてください。
- phases: 「最初の30日」「31〜60日」「61〜90日」の3つ。それぞれ period（期間名）と actions（具体的な行動、3〜4個、各30〜70字）
- closing: 締めくくりのメッセージ（150〜250字）。最後に、当社のおすすめの支援でどう手伝えるかを一文で添える`,
    schema: obj({ phases: { type: 'array', items: obj({ period: str, actions: strArr }) }, closing: str })
  }
];

export const SECTION_IDS = SECTIONS.map(s => s.id);

// ---------- AIで章を書く ----------
export async function writeSection(section, meta) {
  if (!process.env.ANTHROPIC_API_KEY) return { ...fallbackSection(section.id, meta), source: 'rule' };
  const client = new Anthropic({ timeout: Number(process.env.AI_TIMEOUT_MS || 25000), maxRetries: 0 });
  try {
    const res = await client.beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 8000,
      output_config: { effort: 'low', format: { type: 'json_schema', schema: section.schema } },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: SYSTEM,
      messages: [{ role: 'user', content: `【診断の回答】\n${profileText(meta)}\n\n【依頼】\n${section.instruction}` }]
    });
    if (res.stop_reason === 'refusal') throw new Error('refused');
    const text = res.content.filter(b => b.type === 'text').map(b => b.text).join('');
    return { ...JSON.parse(text), source: 'ai' };
  } catch (err) {
    console.error(`section ${section.id} failed:`, err?.status ?? '', err?.message ?? err);
    return { ...fallbackSection(section.id, meta), source: 'rule' };
  }
}

// ---------- AIが使えないときの定型の章 ----------
export function fallbackSection(id, meta) {
  const a = meta.answers, x = meta.extra, s = meta.score;
  const low = [...meta.dims].sort((p, q) => p.score - q.score);
  if (id === 'summary') {
    const pts = ruleReport(a, s);
    return {
      headline: s.urgency >= 60 ? '早めの着手で、選択肢を広く保てる段階です' : '今のうちに準備を進めることで、将来の選択肢が広がります',
      overview: pts.slice(0, 2).join('\n\n'),
      strengths: meta.dims.filter(d => d.score >= 65).map(d => `${d.label}の面で、承継に向けた土台が整っています。`).slice(0, 3)
        .concat(['診断を通じて、承継について考え始めていること自体が大きな一歩です。']).slice(0, 4),
      concerns: low.slice(0, 3).map(d => `${d.label}に課題が見られます。早めに状況を整理しておくことをおすすめします。`)
    };
  }
  if (id === 'options') {
    const fit = { family: ['高', '低', '中'], internal: ['低', '高', '中'], none: ['低', '低', '高'], undecided: ['中', '中', '中'] }[a.successor] || ['中', '中', '中'];
    return {
      rows: [
        { option: '親族内承継', fit: fit[0], reason: '親族に継ぐ意思と適性のある人がいるかどうかが、最初の判断材料になります。', issues: '後継者の育成期間、株式の移転にかかる税金、相続人の間の公平性が主な論点です。' },
        { option: '社内承継（MBO・EBO）', fit: fit[1], reason: '社内に経営を任せられる人材がいるかどうかで、現実的な選択肢になるかが決まります。', issues: '株式を買い取る資金の調達と、社長の個人保証の引き継ぎが主な論点です。' },
        { option: '第三者への譲渡（M&A）', fit: fit[2], reason: '後継者が身近にいない場合でも、事業と雇用を残せる選択肢です。', issues: '相手先選び、条件交渉、提示された条件の妥当性の確認が主な論点です。' }
      ],
      recommendation: 'ひとつに決め打ちせず、3つの選択肢を並べて比較することから始めましょう。それぞれにかかる時間と準備を把握しておくと、判断がしやすくなります。'
    };
  }
  if (id === 'risks') {
    const items = [];
    if (x.guarantee === 'guaranteed') items.push({ title: '個人保証の扱い', detail: '社長の個人保証は、承継の条件の中で外したり引き継いだりする交渉が必要になります。金融機関との早めの相談が有効です。', priority: '高' });
    if (x.shareholders === 'family' || x.shareholders === 'outside') items.push({ title: '株主の分散', detail: '株式が分散していると、承継や譲渡の際に株主の合意を得る手間がかかります。株主の意向を早めに確認しておきましょう。', priority: '高' });
    if (x.dependency === 'high') items.push({ title: '特定取引先への依存', detail: '売上が特定の取引先に偏っていると、承継後の事業の安定性が懸念されやすくなります。取引の分散や契約の見直しを検討しましょう。', priority: '中' });
    if (x.keyperson === 'high') items.push({ title: '社長への依存', detail: '社長がいないと回らない状態は、承継の大きな壁になります。業務の見える化と、幹部への権限移譲を少しずつ進めましょう。', priority: '高' });
    if (a.finance !== 'ready') items.push({ title: '数字・資料の整理', detail: '決算書や資産・負債の状況を整理しておくと、自社の価値を正しく把握でき、交渉でも説明しやすくなります。', priority: '中' });
    items.push({ title: '情報管理', detail: '承継やM&Aの検討が早い段階で広まると、社員や取引先に不安が生じることがあります。相談する範囲を絞って進めましょう。', priority: '中' });
    return { items: items.slice(0, 6) };
  }
  if (id === 'value') {
    return {
      intro: '企業価値は、決算書の数字だけでなく、事業の安定性や人材、取引先との関係なども含めて評価されます。承継の前に課題を整えておくことで、選べる道も広がります。',
      items: low.slice(0, 4).map(d => ({ title: `${d.label}の改善`, detail: `${d.label}は、承継の進めやすさや相手先からの評価に関わります。現状を整理し、改善できる点から取り組みましょう。` }))
    };
  }
  return {
    phases: [
      { period: '最初の30日', actions: ['承継について、誰に相談するかを決める', '決算書（直近3期分）と主な契約書を手元にそろえる', '承継で大切にしたいことを書き出す'] },
      { period: '31〜60日', actions: ['3つの選択肢それぞれの進め方と期間を確認する', '株主や借入・個人保証の状況を整理する', '社長しか分からない業務を洗い出す'] },
      { period: '61〜90日', actions: ['進める方向性を決め、大まかなスケジュールを作る', '必要に応じて専門家に具体的な相談をする', '社内で任せられる業務から引継ぎを始める'] }
    ],
    closing: `承継は、早く準備を始めるほど選択肢が広がります。まずは最初の30日の行動から始めてみてください。${SERVICES[s.service].name}では、${SERVICES[s.service].why}`
  };
}

// ---------- メール ----------
export async function sendMail(payload) {
  const key = process.env.RESEND_API_KEY, from = process.env.MAIL_FROM;
  if (!key || !from) return false;
  const replyTo = process.env.REPLY_TO || process.env.STAFF_EMAIL;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, ...(replyTo ? { reply_to: replyTo } : {}), ...payload })
  });
  if (!r.ok) throw new Error(`resend ${r.status}: ${await r.text()}`);
  return true;
}

export function reportUrl(req, id) {
  const origin = (process.env.URL || new URL(req.url).origin).replace(/\/$/, '');
  return `${origin}/report.html?id=${id}`;
}

export function buildMeta(body) {
  const answers = sanitize(QUESTIONS, body?.answers);
  const extra = sanitize(EXTRA_QUESTIONS, body?.extra);
  const clip = (v, n) => String(v ?? '').slice(0, n).trim();
  const contact = {
    company: clip(body?.contact?.company, 100), name: clip(body?.contact?.name, 60),
    email: clip(body?.contact?.email, 120).toLowerCase(), phone: clip(body?.contact?.phone, 30)
  };
  const score = scoreAnswers(answers);
  return { answers, extra, contact, score, dims: dimensions(answers, extra), createdAt: new Date().toISOString() };
}
