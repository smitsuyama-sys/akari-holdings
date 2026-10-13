// 詳細レポートの完成：利用者と担当者にメールを送る（1回だけ）
import { json, store, isId, SECTION_IDS, sendMail, reportUrl } from '../lib/report.mjs';
import { QUESTIONS, EXTRA_QUESTIONS, SERVICES, labelOf, labelOfExtra } from '../../assets/shindan-core.mjs';

export const config = { path: '/api/report/finish' };

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  let body;
  try { body = await req.json(); } catch { return json({ error: 'bad_request' }, 400); }
  if (!isId(body?.id)) return json({ error: 'bad_request' }, 400);

  const blobs = store();
  const metaKey = `${body.id}/meta`;
  const meta = await blobs.get(metaKey, { type: 'json' });
  if (!meta) return json({ error: 'not_found' }, 404);
  if (meta.finishedAt) return json({ emailed: !!meta.emailed, tier: meta.score.tier });

  const sections = {};
  for (const sid of SECTION_IDS) {
    const sec = await blobs.get(`${body.id}/sec/${sid}`, { type: 'json' });
    if (!sec) return json({ error: 'incomplete', missing: sid }, 409);
    sections[sid] = sec;
  }

  const url = reportUrl(req, body.id);
  const { contact: c, score: s } = meta;
  const svc = SERVICES[s.service];
  const isA = s.tier === 'A';
  let emailed = false;
  try {
    const booking = process.env.BOOKING_URL;
    emailed = await sendMail({
      to: c.email,
      subject: '【光ホールディングス】事業承継・M&A 詳細診断レポートのご案内',
      text: `${c.company}\n${c.name} 様\n\nこのたびは診断をご利用いただき、ありがとうございます。\n` +
        `ご回答をもとに作成した詳細レポートは、下記のページからいつでもご覧いただけます（PDFでの保存・印刷も可能です）。\n\n${url}\n\n` +
        `――――――――――\n${sections.summary.headline || ''}\n承継の準備度：${s.readiness}／100\nおすすめの支援：${svc.name}\n――――――――――\n\n` +
        (isA ? '担当者がレポートの内容を確認し、補足を添えて改めてご連絡いたします。\n'
             : 'レポートの内容についてのご質問やご相談は、このメールにそのままご返信ください。\n') +
        (booking ? `\n30分の無料面談はこちらからご予約いただけます。\n${booking}\n` : '') +
        `\n※本レポートは一般的な情報提供を目的としたもので、個別の法務・税務・投資判断に関する助言ではありません。\n\n光（あかり）ホールディングス株式会社`
    });
    if (process.env.STAFF_EMAIL) {
      const detail = [...QUESTIONS.map(q => `${q.title} → ${labelOf(q.id, meta.answers[q.id]) || '未回答'}`),
        ...EXTRA_QUESTIONS.map(q => `${q.title} → ${labelOfExtra(q.id, meta.extra[q.id]) || '未回答'}`)].join('\n');
      await sendMail({
        to: process.env.STAFF_EMAIL,
        subject: `${isA ? '【要対応】' : ''}【診断リード：見込み度${s.tier}】${c.company} ${c.name}様`,
        text: `見込み度：${s.tier}（${s.fit}点）${isA ? '\n→ レポートを確認し、補足を添えてご本人に連絡してください。' : ''}\n` +
          `準備度：${s.readiness}　緊急度：${s.urgency}\n推奨：${svc.name}\n\nレポート：${url}\n\n` +
          `会社名：${c.company}\n氏名：${c.name}\nメール：${c.email}\n電話：${c.phone || '—'}\n\n${detail}`
      });
    }
  } catch (err) {
    console.error('mail failed:', err?.message ?? err);
  }
  await blobs.setJSON(metaKey, { ...meta, finishedAt: new Date().toISOString(), emailed });
  return json({ emailed, tier: s.tier });
};
