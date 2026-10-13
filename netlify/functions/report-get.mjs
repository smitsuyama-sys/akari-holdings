// 詳細レポートの表示用データを返す（連絡先は含めない）
import { json, store, isId, SECTIONS } from '../lib/report.mjs';
import { SERVICES } from '../../assets/shindan-core.mjs';

export const config = { path: '/api/report' };

export default async (req) => {
  const id = new URL(req.url).searchParams.get('id');
  if (!isId(id)) return json({ error: 'bad_request' }, 400);
  const blobs = store();
  const meta = await blobs.get(`${id}/meta`, { type: 'json' });
  if (!meta) return json({ error: 'not_found' }, 404);
  const sections = {};
  for (const s of SECTIONS) sections[s.id] = await blobs.get(`${id}/sec/${s.id}`, { type: 'json' });
  return json({
    company: meta.contact.company, name: meta.contact.name, createdAt: meta.createdAt,
    readiness: meta.score.readiness, urgency: meta.score.urgency, dims: meta.dims,
    service: { ...SERVICES[meta.score.service], key: meta.score.service },
    titles: Object.fromEntries(SECTIONS.map(s => [s.id, s.title])), sections
  });
};
