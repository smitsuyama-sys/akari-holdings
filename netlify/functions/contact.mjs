// お問い合わせフォーム：担当者への通知メールと、お客様への受付確認メールを送る
// 記録そのものは Netlify Forms（フォーム名 contact）に残る。ここはメール送信だけを担う。
import { createHash } from 'node:crypto';
import { getStore } from '@netlify/blobs';
import { json, sendMail } from '../lib/report.mjs';

export const config = { path: '/api/contact' };

const FIELDS = [
  ['type', 'お問い合わせの種類'], ['name', 'お名前'], ['kana', 'フリガナ'], ['company', '会社名'],
  ['position', '役職'], ['email', 'メールアドレス'], ['phone', '電話番号'], ['reply', 'ご希望の連絡方法'],
  ['timing', 'ご検討の時期'], ['meeting', '面談のご希望'], ['message', 'お問い合わせ内容']
];
const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, max);
const oneLine = v => v.replace(/[\r\n]+/g, ' ');

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  let body;
  try { body = await req.json(); } catch { return json({ error: 'bad_request' }, 400); }
  if (body?.['bot-field']) return json({ ok: true });
  if (body?.consent !== 'yes') return json({ error: 'consent_required' }, 400);

  const d = {};
  for (const [k] of FIELDS) d[k] = clean(body[k], k === 'message' ? 3000 : 200);
  for (const k of Object.keys(d)) if (k !== 'message') d[k] = oneLine(d[k]);
  if (!d.type || !d.name || !d.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return json({ error: 'invalid' }, 400);

  // 同じメールアドレスからの連続送信では、受付確認メールを5分に1回までにする
  const blobs = getStore({ name: 'contacts', consistency: 'strong' });
  const key = `by-email/${createHash('sha256').update(d.email.toLowerCase()).digest('hex')}`;
  const last = await blobs.get(key, { type: 'json' }).catch(() => null);
  const throttled = last && Date.now() - last.at < 5 * 60 * 1000;
  await blobs.setJSON(key, { at: Date.now() }).catch(() => {});

  const staff = process.env.STAFF_EMAIL;
  const lines = FIELDS.filter(([k]) => d[k]).map(([k, label]) => k === 'message' ? `■ ${label}\n${d[k]}` : `■ ${label}：${d[k]}`);
  let staffSent = false, customerSent = false;
  try {
    if (staff) staffSent = await sendMail({
      to: [staff],
      reply_to: d.email,
      subject: `【お問い合わせ：${d.type}】${d.company ? d.company + ' ' : ''}${d.name}様`,
      text: `ホームページのお問い合わせフォームから、新しいお問い合わせがありました。\n\n${lines.join('\n')}\n\n※このメールに返信すると、お問い合わせいただいた方に届きます。`
    });
  } catch (e) { console.error('staff mail', e); }
  try {
    if (!throttled) customerSent = await sendMail({
      to: [d.email],
      subject: '【光ホールディングス】お問い合わせを受け付けました',
      text: `${d.company ? d.company + '\n' : ''}${d.name} 様\n\nこのたびは光（あかり）ホールディングスへお問い合わせいただき、ありがとうございます。\n下記の内容で受け付けました。担当者より、あらためてご連絡いたします。\n\n■ お問い合わせの種類：${d.type}\n■ ご希望の連絡方法：${d.reply || 'どちらでも'}\n\nご相談の内容は秘密を厳守いたします。\nお急ぎの場合は、このメールにご返信ください。\n\nなお、このメールにお心当たりのない場合は、お手数ですが破棄してください。\n\n――――――――――\n光（あかり）ホールディングス株式会社\n〒810-0022 福岡県福岡市中央区薬院4丁目13-62\nhttps://akari-hd.co.jp/`
    });
  } catch (e) { console.error('customer mail', e); }
  return json({ ok: true, staffSent, customerSent });
};
