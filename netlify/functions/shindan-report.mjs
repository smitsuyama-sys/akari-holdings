// 診断結果から個別レポートを生成し、見込み度を判定して自動メールを送る
//
// 環境変数（Netlify の Site configuration → Environment variables で設定）
//   ANTHROPIC_API_KEY  必須。未設定なら定型レポートのみ返す
//   RESEND_API_KEY     任意。設定すると利用者への自動返信と担当者への通知メールを送る
//   MAIL_FROM          任意。送信元（例: 光ホールディングス <info@example.co.jp>）
//   STAFF_EMAIL        任意。担当者の通知先
//   BOOKING_URL        任意。見込み度Aの方に案内する面談予約ページのURL
import Anthropic from '@anthropic-ai/sdk';
import { QUESTIONS, SERVICES, scoreAnswers, ruleReport, labelOf } from '../../assets/shindan-core.mjs';

export const config = { path: '/api/shindan-report' };

const SYSTEM = `あなたは光（あかり）ホールディングス株式会社のレポート作成担当です。
同社は事業承継・M&A（譲受）、MBO支援、経営支援、M&Aセカンドオピニオンを提供しています。
中小企業の経営者が答えた簡易診断の結果をもとに、本人向けの短い個別レポートを日本語で書きます。

書き方:
- 400〜600字。見出しや記号の箇条書きは使わず、3〜4段落の平易な文章にする
- 回答内容に具体的に触れ、「今の状況」「主な論点」「次の一歩」の順に書く
- 丁寧だが押しつけがましくない口調。不安をあおらない
- 数字や統計、法令の条文番号は書かない（根拠を示せないため）
- 譲渡価格の見込み、税額、成功の保証など、断定的な助言や約束をしない
- 最後の段落で、推奨サービスでどのように手伝えるかを一文で添える`;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const clip = (v, n) => String(v ?? '').slice(0, n).trim();

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  let body;
  try { body = await req.json(); } catch { return json({ error: 'bad_request' }, 400); }

  // 回答は設問の選択肢にあるものだけ受け付ける
  const answers = {};
  for (const q of QUESTIONS) {
    const raw = body?.answers?.[q.id];
    const ok = new Set(q.options.map(o => o.v));
    if (q.type === 'multi') answers[q.id] = (Array.isArray(raw) ? raw : []).filter(v => ok.has(v));
    else if (ok.has(raw)) answers[q.id] = raw;
  }
  const contact = {
    company: clip(body?.contact?.company, 100),
    name: clip(body?.contact?.name, 60),
    email: clip(body?.contact?.email, 120),
    phone: clip(body?.contact?.phone, 30)
  };
  if (!contact.company || !contact.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
    return json({ error: 'invalid_contact' }, 400);
  }

  const score = scoreAnswers(answers);
  const service = SERVICES[score.service];
  const fallback = ruleReport(answers, score).join('\n\n') +
    `\n\n${service.name}では、${service.why}`;

  let report = fallback;
  let aiUsed = false;
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      report = await writeReport(answers, score, service);
      aiUsed = true;
    } catch (err) {
      console.error('report generation failed:', err?.status ?? '', err?.message ?? err);
    }
  }

  let emailed = false;
  try {
    emailed = await sendMails(contact, score, service, report, answers);
  } catch (err) {
    console.error('mail failed:', err?.message ?? err);
  }

  return json({ report, aiUsed, emailed });
};

async function writeReport(answers, score, service) {
  const client = new Anthropic({ timeout: Number(process.env.AI_TIMEOUT_MS || 20000), maxRetries: 0 });
  const lines = QUESTIONS.map(q => `- ${q.title} → ${labelOf(q.id, answers[q.id]) || '未回答'}`);
  const prompt = `診断の回答:\n${lines.join('\n')}\n\n` +
    `承継の準備度: ${score.readiness}/100\n早めに動くべき度合い: ${score.urgency}/100\n` +
    `推奨サービス: ${service.name}（${service.why}）\n\nこの方への個別レポートを書いてください。`;

  const res = await client.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 4000,
    output_config: { effort: 'low' },
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: SYSTEM,
    messages: [{ role: 'user', content: prompt }]
  });
  if (res.stop_reason === 'refusal') throw new Error('refused');
  const text = res.content.filter(b => b.type === 'text').map(b => b.text).join('').trim();
  if (!text) throw new Error('empty response');
  return text;
}

async function sendMails(contact, score, service, report, answers) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  if (!key || !from) return false;

  const send = async (payload) => {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, ...payload })
    });
    if (!r.ok) throw new Error(`resend ${r.status}: ${await r.text()}`);
  };

  const booking = process.env.BOOKING_URL;
  const invite = score.tier === 'A' && booking
    ? `\n\nより具体的なお話をご希望でしたら、下記より30分の無料面談をご予約いただけます。\n${booking}\n`
    : '\n\nご不明な点やご相談がございましたら、このメールにそのままご返信ください。\n';

  await send({
    to: contact.email,
    subject: '【光ホールディングス】事業承継・M&A 準備度診断の個別レポート',
    text: `${contact.company}\n${contact.name} 様\n\nこのたびは診断をご利用いただき、ありがとうございます。\n` +
      `回答内容をもとにした個別レポートをお送りします。\n\n` +
      `――――――――――\n承継の準備度：${score.readiness}／100\n早めに動くべき度合い：${score.urgency}／100\n` +
      `おすすめの支援：${service.name}\n――――――――――\n\n${report}${invite}\n` +
      `※本レポートは一般的な情報提供を目的としたもので、個別の法務・税務・投資判断に関する助言ではありません。\n\n` +
      `光（あかり）ホールディングス株式会社`
  });

  if (process.env.STAFF_EMAIL) {
    const detail = QUESTIONS.map(q => `${q.title}\n  → ${labelOf(q.id, answers[q.id]) || '未回答'}`).join('\n');
    await send({
      to: process.env.STAFF_EMAIL,
      subject: `【診断リード：見込み度${score.tier}】${contact.company} ${contact.name}様`,
      text: `見込み度：${score.tier}（${score.fit}点）\n準備度：${score.readiness}　緊急度：${score.urgency}\n推奨：${service.name}\n\n` +
        `会社名：${contact.company}\n氏名：${contact.name}\nメール：${contact.email}\n電話：${contact.phone || '—'}\n\n` +
        `${detail}\n\n――送付したレポート――\n${report}`
    });
  }
  return true;
}
