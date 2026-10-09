// 事業承継・M&A 準備度診断 — 画面制御
import { QUESTIONS, EXTRA_QUESTIONS, SERVICES, scoreAnswers, ruleReport, labelOf, labelOfExtra } from './shindan-core.mjs';

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
        <span class="sd-badge">無料</span>
        <h3 class="sd-h3">詳細診断レポートを作成する</h3>
        <p class="sd-hint">あと少しの質問にお答えいただくと、A4で5〜8ページ相当の詳しいレポートを作成します。<br>
          ①現状診断 ②承継の選択肢の比較 ③リスクと論点 ④企業価値を高めるために ⑤90日の行動計画<br>
          作成したレポートは画面で見られるほか、PDFで保存・印刷できます。営業目的の電話はいたしません。</p>
        <form class="sd-form" id="sdForm" novalidate>
          <input type="hidden" name="form-name" value="shindan">
          <p hidden><label>bot <input name="bot-field"></label></p>
          <fieldset class="sd-extra">
            <legend>会社について（詳細レポート用）</legend>
            ${EXTRA_QUESTIONS.map(extraField).join('')}
          </fieldset>
          <fieldset class="sd-extra">
            <legend>レポートの送付先</legend>
            <div class="field"><label>会社名<span class="req">必須</span></label><input name="company" autocomplete="organization" required></div>
            <div class="field"><label>お名前<span class="req">必須</span></label><input name="name" autocomplete="name" required></div>
            <div class="field"><label>メールアドレス<span class="req">必須</span></label><input name="email" type="email" autocomplete="email" required></div>
            <div class="field"><label>電話番号（任意）</label><input name="phone" type="tel" autocomplete="tel"></div>
          </fieldset>
          <label class="sd-consent"><input type="checkbox" name="consent" value="yes" required> 回答内容を、レポートの作成と当社からのご連絡に利用することに同意します</label>
          <button type="submit" class="btn btn-primary btn-full">詳細レポートを作成する</button>
          <p class="form-note" id="sdNote" role="status"></p>
        </form>
        <div id="sdProgress"></div>
      </div>
      <p class="sd-disclaimer">本診断は一般的な情報提供を目的とした簡易的なものであり、個別の法務・税務・投資判断に関する助言ではありません。</p>
    `;
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('sdForm').addEventListener('submit', e => submitLead(e, s));
  }

  function extraField(q) {
    if (q.type === 'multi') {
      return `<div class="field"><label>${esc(q.title)}</label><div class="sd-checks">${q.options.map(o =>
        `<label><input type="checkbox" name="x_${q.id}" value="${o.v}"> ${esc(o.label)}</label>`).join('')}</div></div>`;
    }
    return `<div class="field"><label>${esc(q.title)}<span class="req">必須</span></label><select name="x_${q.id}" required>
      <option value="">選択してください</option>${q.options.map(o => `<option value="${o.v}">${esc(o.label)}</option>`).join('')}</select></div>`;
  }

  const post = (url, body) => fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  }).then(async r => { const d = await r.json().catch(() => ({})); if (!r.ok) throw Object.assign(new Error(d.error || r.status), { data: d }); return d; });

  async function submitLead(e, s) {
    e.preventDefault();
    const form = e.target;
    const note = document.getElementById('sdNote');
    const v = n => (form.elements[n].value || '').trim();
    const extra = {};
    let missing = false;
    for (const q of EXTRA_QUESTIONS) {
      if (q.type === 'multi') extra[q.id] = [...form.querySelectorAll(`input[name="x_${q.id}"]:checked`)].map(i => i.value);
      else { extra[q.id] = v(`x_${q.id}`); if (!extra[q.id]) missing = true; }
    }
    if (missing || !v('company') || !v('name') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email')) || !form.elements.consent.checked) {
      note.textContent = '未選択の項目、必須項目、同意欄をご確認ください。';
      note.className = 'form-note err';
      return;
    }
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    note.textContent = '送信しています…';
    note.className = 'form-note';
    const contact = { company: v('company'), name: v('name'), email: v('email'), phone: v('phone') };

    // 1) レポートの受付（IDの発行）
    let job;
    try {
      job = await post('/api/report/start', { answers, extra, contact, consent: true });
    } catch {
      note.textContent = '送信に失敗しました。お手数ですが時間をおいて再度お試しください。';
      note.className = 'form-note err';
      btn.disabled = false;
      return;
    }

    // 2) Netlify Forms にも保存（担当者へのメール通知はNetlify側で設定）
    const fd = new URLSearchParams({
      'form-name': 'shindan', 'bot-field': form.elements['bot-field'].value,
      ...contact, consent: 'yes',
      tier: `${s.tier}（見込み度：A=高 / B=中 / C=低）`,
      readiness: `${s.readiness} / 100`, urgency: `${s.urgency} / 100`,
      service: SERVICES[s.service].name, report_url: job.url,
      answers: [...QUESTIONS.map(q => `■ ${q.title}\n  → ${labelOf(q.id, answers[q.id]) || '（選択なし）'}`),
        ...EXTRA_QUESTIONS.map(q => `■ ${q.title}\n  → ${labelOfExtra(q.id, extra[q.id]) || '（選択なし）'}`)].join('\n')
    });
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: fd.toString() }).catch(() => {});

    form.hidden = true;
    note.textContent = '';
    const box = document.getElementById('sdProgress');
    box.innerHTML = `<div class="sd-progress-box"><p class="sd-h3">レポートを作成しています…</p>
      <p class="sd-hint">章ごとに作成しています。1〜2分ほどお待ちください（このページを閉じないでください）。</p>
      <ul class="sd-steps">${job.sections.map(x => `<li data-sec="${x.id}"><span class="st">作成中</span>${esc(x.title)}</li>`).join('')}</ul></div>`;
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // 3) 章ごとに同時に作成（失敗したら1回だけやり直す）
    const mark = (id, ok) => { const li = box.querySelector(`[data-sec="${id}"]`); li.classList.add(ok ? 'done' : 'fail'); li.querySelector('.st').textContent = ok ? '完了' : '作成できませんでした'; };
    await Promise.all(job.sections.map(async x => {
      for (let i = 0; i < 2; i++) {
        try { await post('/api/report/section', { id: job.id, section: x.id }); mark(x.id, true); return; } catch {}
      }
      mark(x.id, false);
    }));

    // 4) 完成（メール送付）
    let fin = {};
    try { fin = await post('/api/report/finish', { id: job.id }); } catch {}
    const ok = !!fin.tier;
    box.innerHTML = `<div class="sd-progress-box sd-done">
      <p class="sd-h3">${ok ? '詳細レポートができました' : 'レポートの一部を作成できませんでした'}</p>
      <p class="sd-hint">${ok
        ? (fin.emailed ? 'レポートのページのURLを、ご登録のメールアドレスにもお送りしました。' : 'このあと表示するページのURLを保存しておくと、あとからいつでもご覧いただけます。')
          + (fin.tier === 'A' ? '<br>担当者がレポートの内容を確認し、補足を添えて改めてご連絡いたします。' : '')
        : 'お手数ですが、少し時間をおいてから下のボタンでレポートを開き直してください。内容を確認のうえ、担当者よりご連絡いたします。'}</p>
      <a class="btn btn-primary btn-full" href="${job.url}">詳細レポートを開く</a></div>`;
  }

  renderQuestion();
}
