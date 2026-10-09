// 詳細診断レポートの表示
const root = document.getElementById('reportApp');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const paras = t => String(t ?? '').split(/\n{2,}/).map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('');
const lv = v => `<span class="rp-level lv-${{ 高: 'h', 中: 'm', 低: 'l' }[v] || 'm'}">${esc(v)}</span>`;

function radar(dims) {
  const n = dims.length, cx = 170, cy = 150, R = 105;
  const pt = (i, r) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  const ring = f => dims.map((_, i) => pt(i, R * f).join(',')).join(' ');
  const grid = [0.25, 0.5, 0.75, 1].map(f => `<polygon points="${ring(f)}" class="rd-grid"/>`).join('');
  const axes = dims.map((_, i) => { const [x, y] = pt(i, R); return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="rd-axis"/>`; }).join('');
  const shape = dims.map((d, i) => pt(i, R * Math.max(0.04, d.score / 100)).join(',')).join(' ');
  const labels = dims.map((d, i) => {
    const [x, y] = pt(i, R + 22);
    const anchor = Math.abs(x - cx) < 8 ? 'middle' : x > cx ? 'start' : 'end';
    return `<text x="${x}" y="${y}" text-anchor="${anchor}" class="rd-label">${esc(d.label)}<tspan class="rd-val" x="${x}" dy="15">${d.score}</tspan></text>`;
  }).join('');
  return `<svg viewBox="-50 0 440 310" class="rp-radar" role="img" aria-label="観点別のスコア">${grid}${axes}<polygon points="${shape}" class="rd-shape"/>${labels}</svg>`;
}

function render(d) {
  const S = d.sections, T = d.titles;
  const date = new Date(d.createdAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  const missing = Object.entries(S).filter(([, v]) => !v).map(([k]) => k);
  document.title = `${d.company} 様　詳細診断レポート | 光（あかり）ホールディングス株式会社`;
  root.innerHTML = `
  <div class="rp-actions no-print"><button class="btn btn-primary" onclick="window.print()">PDFで保存・印刷する</button></div>
  ${missing.length ? '<p class="rp-warn no-print">一部の章がまだできていません。少し時間をおいてから、ページを開き直してください。</p>' : ''}
  <section class="rp-cover">
    <p class="rp-kicker">事業承継・M&amp;A 詳細診断レポート</p>
    <h1 class="rp-company">${esc(d.company)} 様</h1>
    <p class="rp-date">作成日：${esc(date)}　／　光（あかり）ホールディングス株式会社</p>
    ${S.summary ? `<p class="rp-headline">${esc(S.summary.headline)}</p>` : ''}
    <div class="rp-scores">
      <div class="rp-score-box">
        <div class="rp-score"><span>承継の準備度</span><b>${d.readiness}</b><small>/100</small></div>
        <div class="rp-score"><span>早めに動くべき度合い</span><b>${d.urgency}</b><small>/100</small></div>
        <div class="rp-score rp-svc"><span>おすすめの支援</span><a href="${esc(d.service.url)}">${esc(d.service.name)}</a></div>
      </div>
      <figure class="rp-radar-wrap">${radar(d.dims)}<figcaption>観点別のスコア（高いほど承継に向けて整っている）</figcaption></figure>
    </div>
  </section>

  ${S.summary ? `<section class="rp-sec"><h2>${esc(T.summary)}</h2>${paras(S.summary.overview)}
    <div class="rp-two">
      <div class="rp-box rp-good"><h3>強み</h3><ul>${S.summary.strengths.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <div class="rp-box rp-bad"><h3>優先して向き合う課題</h3><ul>${S.summary.concerns.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
    </div></section>` : ''}

  ${S.options ? `<section class="rp-sec"><h2>${esc(T.options)}</h2>
    <div class="col-table-wrap"><table class="col-table rp-table">
      <thead><tr><th>選択肢</th><th style="min-width:64px">適合度</th><th>判断の理由</th><th>主な論点</th></tr></thead>
      <tbody>${S.options.rows.map(r => `<tr><th>${esc(r.option)}</th><td class="c">${lv(r.fit)}</td><td>${esc(r.reason)}</td><td>${esc(r.issues)}</td></tr>`).join('')}</tbody>
    </table></div>
    <div class="rp-box"><h3>検討の進め方</h3>${paras(S.options.recommendation)}</div></section>` : ''}

  ${S.risks ? `<section class="rp-sec"><h2>${esc(T.risks)}</h2>
    <div class="rp-cards">${S.risks.items.map(r => `<div class="rp-card"><div class="rp-card-h">${lv(r.priority)}<h3>${esc(r.title)}</h3></div><p>${esc(r.detail)}</p></div>`).join('')}</div>
    <p class="rp-legend">優先度：${lv('高')} 早めに対応　${lv('中')} 計画的に対応　${lv('低')} 状況を見て対応</p></section>` : ''}

  ${S.value ? `<section class="rp-sec"><h2>${esc(T.value)}</h2>${paras(S.value.intro)}
    <ol class="rp-num">${S.value.items.map(v => `<li><b>${esc(v.title)}</b><p>${esc(v.detail)}</p></li>`).join('')}</ol></section>` : ''}

  ${S.plan ? `<section class="rp-sec"><h2>${esc(T.plan)}</h2>
    <div class="rp-plan">${S.plan.phases.map((p, i) => `<div class="rp-phase"><span class="rp-phase-no">PHASE ${i + 1}</span><h3>${esc(p.period)}</h3>
      <ul>${p.actions.map(a => `<li>${esc(a)}</li>`).join('')}</ul></div>`).join('')}</div>
    ${paras(S.plan.closing)}</section>` : ''}

  <section class="rp-cta">
    <h2>このレポートについて、専門家と話してみませんか</h2>
    <p>レポートの内容をもとに、貴社の状況に合わせた進め方を一緒に整理します。初回のご相談は無料です。</p>
    <a class="btn btn-primary" href="contact.html">無料で相談する</a>
    <a class="btn rp-btn-sub" href="${esc(d.service.url)}">${esc(d.service.name)}について見る</a>
  </section>
  <p class="rp-disclaimer">本レポートは、ご回答の内容をもとに自動で作成した一般的な情報提供であり、個別の法務・税務・投資判断に関する助言ではありません。実際の判断にあたっては、専門家にご相談ください。</p>`;
}

(async () => {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) { root.innerHTML = '<p class="rp-warn">レポートが見つかりません。メールに記載のURLから開いてください。</p>'; return; }
  try {
    const r = await fetch(id === 'sample' ? 'assets/report-sample.json' : `/api/report?id=${encodeURIComponent(id)}`);
    if (!r.ok) throw new Error(r.status);
    render(await r.json());
  } catch {
    root.innerHTML = '<p class="rp-warn">レポートを読み込めませんでした。URLをご確認のうえ、時間をおいて再度お試しください。</p>';
  }
})();
