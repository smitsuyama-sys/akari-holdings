// 詳細レポートの受付：回答を保存して、レポートIDを発行する
import { createHash, randomUUID } from 'node:crypto';
import { json, store, buildMeta, SECTIONS, reportUrl } from '../lib/report.mjs';

export const config = { path: '/api/report/start' };

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  let body;
  try { body = await req.json(); } catch { return json({ error: 'bad_request' }, 400); }
  if (body?.consent !== true) return json({ error: 'consent_required' }, 400);

  const meta = buildMeta(body);
  const c = meta.contact;
  if (!c.company || !c.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) return json({ error: 'invalid_contact' }, 400);

  const blobs = store();
  // 同じメールアドレスから短時間に何度も作られないよう、10分以内なら同じレポートを返す
  const emailKey = `by-email/${createHash('sha256').update(c.email).digest('hex')}`;
  const recent = await blobs.get(emailKey, { type: 'json' });
  let id = recent && Date.now() - recent.at < 10 * 60 * 1000 ? recent.id : null;
  if (!id) {
    id = randomUUID();
    await blobs.setJSON(`${id}/meta`, meta);
    await blobs.setJSON(emailKey, { id, at: Date.now() });
  }
  return json({ id, url: reportUrl(req, id), tier: meta.score.tier, sections: SECTIONS.map(s => ({ id: s.id, title: s.title })) });
};
