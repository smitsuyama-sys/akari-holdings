// 事業承継・M&A 準備度診断 — 画面制御
import { QUESTIONS, SERVICES, scoreAnswers, ruleReport, labelOf } from './shindan-core.mjs';

const root = document.getElementById('shindanApp');
if (root) init();

function init() {
  const answers = {};
  let step = 0;
  let started = false;

  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function renderQuestion() {
    const q = QUESTIONS[step];
    root.innerHTML = '';
    const card = el('div', 'sd-card');
    const bar = el('div', 'sd-progress');
    bar.appendChild(el('span', null)).style.width = ((step) / QUESTIONS.length * 100) + '%';
    card.appendChild(bar);
    card.appendChild(el('p', 'sd-step', `Q${step + 1} <span>/ ${QUESTIONS.length}</span>`));
    card.appendChild(el('h2', 'sd-q', esc(q.title)));
    if (q.type === 'multi') card.appendChild(el('p', 'sd-hint', '複数選択できます（該当がなければそのまま「結果を見る」へ）'));

    const list = el('div', 'sd-options');
    q.options.forEach(o => {
      const b = el('button', 'sd-opt', esc(o.label));
      b.type = 'button';
      const selected = q.type === 'multi' ? (answers[q.id] || []).includes(o.v) : answers[q.id] === o.v;
      if (selected) b.classList.add('on');
      b.setAttribute('aria-pressed', selected ? 'true' : 'false');
      b.addEventListener('click', () => {
        if (q.type === 'multi') {
          const cur = new Set(answers[q.id] || []);
          cur.has(o.v) ? cur.delete(o.v) : cur.add(o.v);
          answers[q.id] = [...cur];
          renderQuestion();
        } else {
          answers[q.id] = o.v;
          next();
        }
      });
      list.appendChild(b);
    });
    card.appendChild(list);

    const nav = el('div', 'sd-nav');
    if (step > 0) {
      const back = el('button', 'sd-back', '← 戻る');
      back.type = 'button';
      back.addEventListener('click', () => { step--; renderQuestion(); });
      nav.appendChild(back);
    }
    if (q.type === 'multi') {
      const go = el('button', 'btn btn-primary', '結果を見る');
      go.type = 'button';
      go.addEventListener('click', next);
      nav.appendChild(go);
    }
    card.appendChild(nav);
    root.appendChild(card);
    if (started) root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    started = true;
  }

  function next() {
    if (step < QUESTIONS.length - 1) { step++; renderQuestion(); }
    else renderResult();
  }

  function meter(label, v) {
    return `<div class="sd-meter"><div class="sd-meter-top"><span>${label}</span><b>${v}</b></div>` +
      `<div class="sd-meter-bar"><span style="width:${v}%"></span></div></div>`;
  }

  function renderResult() {
    const s = scoreAnswers(answers);
    const svc = SERVICES[s.service];
    const points = ruleReport(answers, s);
    root.innerHTML = `
      <div class="sd-card sd-result">
        <p class="sd-step">診断結果</p>
        <h2 class="sd-q">あなたの会社の現在地</h2>
        <div class="sd-meters">
          ${meter('承継の準備度', s.readiness)}
          ${meter('早めに動くべき度合い', s.urgency)}
        </div>
        <h3 class="sd-h3">ポイント</h3>
        <ul class="sd-points">${points.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
        <div class="sd-reco">
          <span class="sd-reco-label">おすすめの支援</span>
          <a href="${svc.url}" class="sd-reco-name">${esc(svc.name)} →</a>
          <p>${esc(svc.why)}</p>
        </div>
      </div>
      <div class="sd-card">
        <h3 class="sd-h3">詳しい個別レポートを無料で受け取る</h3>
        <p class="sd-hint">回答内容をもとに、論点と次の一歩を整理したレポートをお送りします。営業目的の電話はいたしません。</p>
        <form class="sd-form" id="sdForm" novalidate>
          <input type="hidden" name="form-name" value="shindan">
          <p hidden><label>bot <input name="bot-field"></label></p>
          <div class="field"><label>会社名<span class="req">必須</span></label><input name="company" autocomplete="organization" required></div>
          <div class="field"><label>お名前<span class="req">必須</span></label><input name="name" autocomplete="name" required></div>
          <div class="field"><label>メールアドレス<span class="req">必須</span></label><input name="email" type="email" autocomplete="email" required></div>
          <div class="field"><label>電話番号（任意）</label><input name="phone" type="tel" autocomplete="tel"></div>
          <label class="sd-consent"><input type="checkbox" name="consent" value="yes" required> 回答内容を当社からのご連絡に利用することに同意します</label>
          <button type="submit" class="btn btn-primary btn-full">レポートを受け取る</button>
          <p class="form-note" id="sdNote" role="status"></p>
        </form>
        <div id="sdAi"></div>
      </div>
      <p class="sd-disclaimer">本診断は一般的な情報提供を目的とした簡易的なものであり、個別の法務・税務・投資判断に関する助言ではありません。</p>
    `;
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('sdForm').addEventListener('submit', e => submitLead(e, s));
  }

  async function submitLead(e, s) {
    e.preventDefault();
    const form = e.target;
    const note = document.getElementById('sdNote');
    const v = n => (form.elements[n].value || '').trim();
    if (!v('company') || !v('name') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email')) || !form.elements.consent.checked) {
      note.textContent = '必須項目と同意欄をご確認ください。';
      note.className = 'form-note err';
      return;
    }
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    note.textContent = '送信しています…';
    note.className = 'form-note';

    const contact = { company: v('company'), name: v('name'), email: v('email'), phone: v('phone') };

    // 1) Netlify Forms に保存（担当者へのメール通知はNetlify側で設定）
    const fd = new URLSearchParams({
      'form-name': 'shindan', 'bot-field': form.elements['bot-field'].value,
      ...contact, consent: 'yes',
      tier: `${s.tier}（見込み度：A=高 / B=中 / C=低）`,
      readiness: `${s.readiness} / 100`, urgency: `${s.urgency} / 100`,
      service: SERVICES[s.service].name,
      answers: QUESTIONS.map(q => `■ ${q.title}\n  → ${labelOf(q.id, answers[q.id]) || '（選択なし）'}`).join('\n')
    });
    try {
      const r = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: fd.toString() });
      if (!r.ok) throw new Error(String(r.status));
    } catch {
      note.textContent = '送信に失敗しました。お手数ですが時間をおいて再度お試しください。';
      note.className = 'form-note err';
      btn.disabled = false;
      return;
    }
    note.textContent = '受け付けました。個別レポートを作成しています（30秒ほどかかる場合があります）…';
    note.className = 'form-note ok';
    form.querySelectorAll('input,button').forEach(x => { x.disabled = true; });

    // 2) AIによる個別レポート（失敗してもリードは保存済み）
    const box = document.getElementById('sdAi');
    try {
      const r = await fetch('/api/shindan-report', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, contact })
      });
      const data = await r.json();
      if (!r.ok || !data.report) throw new Error('no report');
      box.innerHTML = `<div class="sd-ai"><h3 class="sd-h3">個別レポート</h3>${
        data.report.split(/\n{2,}/).map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('')}</div>`;
      note.textContent = data.emailed ? '同じ内容をメールでもお送りしました。' : 'ありがとうございました。担当者よりご連絡いたします。';
    } catch {
      note.textContent = 'ありがとうございました。個別レポートは担当者より追ってお送りいたします。';
    }
  }

  renderQuestion();
}
