// 詳細レポートの1章を作る（作成済みなら保存したものを返す）
import { json, store, isId, SECTIONS, writeSection } from '../lib/report.mjs';

export const config = { path: '/api/report/section' };

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  let body;
  try { body = await req.json(); } catch { return json({ error: 'bad_request' }, 400); }
  const section = SECTIONS.find(s => s.id === body?.section);
  if (!isId(body?.id) || !section) return json({ error: 'bad_request' }, 400);

  const blobs = store();
  const meta = await blobs.get(`${body.id}/meta`, { type: 'json' });
  if (!meta) return json({ error: 'not_found' }, 404);

  const key = `${body.id}/sec/${section.id}`;
  const saved = await blobs.get(key, { type: 'json' });
  if (saved) return json({ section: section.id, content: saved });

  const content = await writeSection(section, meta);
  await blobs.setJSON(key, content);
  return json({ section: section.id, content });
};
