/* 光ホールディングス — interactions (multi-page, rich motion) */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Header shadow on scroll ---
  var header = document.getElementById('siteHeader');

  // --- Scroll progress bar (created dynamically) ---
  var progress = null;
  if (!reduceMotion) {
    progress = document.createElement('div');
    progress.className = 'scroll-progress';
    document.body.appendChild(progress);
  }

  // --- Back to top button (created dynamically) ---
  var toTop = document.createElement('button');
  toTop.className = 'to-top';
  toTop.setAttribute('aria-label', 'ページ上部へ戻る');
  toTop.innerHTML = '↑';
  document.body.appendChild(toTop);
  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  // --- Parallax targets ---
  var heroBg = document.querySelector('.hero-bg');
  if (heroBg && !reduceMotion) heroBg.setAttribute('data-parallax', '0.28');
  var parallaxEls = [].slice.call(document.querySelectorAll('[data-parallax]'));

  // --- Unified scroll handler ---
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('scrolled', y > 20);
    if (progress) {
      var h = document.documentElement;
      var max = (h.scrollHeight - h.clientHeight) || 1;
      progress.style.width = Math.min(100, (y / max) * 100) + '%';
    }
    toTop.classList.toggle('show', y > 600);
    if (!reduceMotion) {
      for (var i = 0; i < parallaxEls.length; i++) {
        var el = parallaxEls[i];
        var sp = parseFloat(el.getAttribute('data-parallax')) || 0.2;
        el.style.transform = 'translate3d(0,' + (y * sp).toFixed(1) + 'px,0)';
      }
    }
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () { onScroll(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  // --- Mobile menu toggle ---
  var toggle = document.getElementById('menuToggle');
  var nav = document.getElementById('gnav');
  if (toggle && nav) {
    var closeMenu = function () {
      nav.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    };
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.classList.toggle('active', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  // --- Active nav link (by current page) ---
  (function () {
    var path = location.pathname.split('/').pop() || 'index.html';
    if (path === '') path = 'index.html';
    document.querySelectorAll('.gnav ul a').forEach(function (a) {
      var href = (a.getAttribute('href') || '').split('/').pop();
      var match = href === path ||
        (path.indexOf('business-') === 0 && href === 'business.html') ||
        (path.indexOf('news-') === 0 && href === 'news.html');
      if (match) { a.classList.add('active'); a.setAttribute('aria-current', 'page'); }
    });
  })();

  // --- Reveal on scroll ---
  var targets = document.querySelectorAll(
    '.section-head, .message-text, .message-figure, .phi-card, .biz-card, ' +
    '.group-card, .news-item, .recruit-inner, .contact-form, .contact-info, ' +
    '.navcard, .rp-card, .info-table, .cta-inner, .stat, [data-reveal]'
  );
  targets.forEach(function (el, i) {
    if (!el.classList.contains('reveal')) el.classList.add('reveal');
    el.style.transitionDelay = ((i % 4) * 0.09).toFixed(2) + 's';
  });
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add('visible'); });
  }

  // --- Count-up numbers ---
  var counters = document.querySelectorAll('[data-count]');
  function fmtCount(el, n) {
    var dec = parseInt(el.getAttribute('data-decimals'), 10) || 0;
    var plain = el.hasAttribute('data-plain');
    if (dec > 0) return n.toFixed(dec);
    return plain ? String(n) : n.toLocaleString('en-US');
  }
  function runCount(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var dec = parseInt(el.getAttribute('data-decimals'), 10) || 0;
    var dur = 1500, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var cur = dec > 0 ? eased * target : Math.floor(eased * target);
      el.textContent = fmtCount(el, cur);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = fmtCount(el, target);
    }
    requestAnimationFrame(step);
  }
  if (counters.length) {
    if (!reduceMotion && 'IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); }
        });
      }, { threshold: 0.4 });
      counters.forEach(function (el) { cio.observe(el); });
    } else {
      counters.forEach(function (el) {
        el.textContent = fmtCount(el, parseFloat(el.getAttribute('data-count')) || 0);
      });
    }
  }

  // --- Page transition on internal navigation ---
  if (!reduceMotion) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href) return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (/^(#|mailto:|tel:|https?:)/.test(href)) return;
      if (href.indexOf('#') !== -1 && href.split('#')[0] === '') return;
      if (!/\.html?($|[?#])/.test(href) && href.indexOf('/') === -1) return;
      e.preventDefault();
      document.body.classList.add('is-leaving');
      setTimeout(function () { window.location.href = href; }, 280);
    });
    window.addEventListener('pageshow', function (ev) {
      if (ev.persisted) document.body.classList.remove('is-leaving');
    });
  }

  // --- Contact form: 種類の選択・ヒント表示・送信（Netlify Forms に記録し、受付メールを自動送信） ---
  var form = document.getElementById('contactForm');
  var note = document.getElementById('formNote');
  if (form && note) {
    var typeSel = form.elements['type'];
    var hint = document.getElementById('cf-type-hint');
    var HINTS = {
      succession: '後継者の状況や、大切にしたいこと（社員の雇用、社名など）をお聞かせください。',
      mbo: '後継者候補（役員・社員）の状況や、株主の構成について分かる範囲でお書きください。',
      second: 'すでに提示されている条件や、相談中の仲介会社・FAの有無をお書きください。資料は面談時に拝見します。',
      shindan: '診断結果やレポートについてのご質問は、レポートのURLを添えていただくとスムーズです。',
      recruit: '採用に関するお問い合わせは、ご経歴や希望する職種をご記入ください。'
    };
    var showHint = function () { if (hint) hint.textContent = HINTS[typeSel.value] || ''; };
    // 各ページのボタンから ?type=second のように来た場合は、種類を選んだ状態にする
    var q = new URLSearchParams(location.search).get('type');
    if (q && typeSel && typeSel.querySelector('option[value="' + q.replace(/[^a-z]/g, '') + '"]')) typeSel.value = q;
    if (typeSel) { typeSel.addEventListener('change', showHint); showHint(); }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var val = function (n) { var el = form.elements[n]; return el ? el.value.trim() : ''; };
      var email = val('email');
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!val('type') || !val('name') || !emailOk || !val('message') || !form.elements['consent'].checked) {
        note.textContent = 'お問い合わせの種類・必須項目・プライバシーポリシーへの同意をご確認ください。';
        note.className = 'form-note err';
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
      note.textContent = '送信しています…';
      note.className = 'form-note';
      var fd = new FormData(form);
      fd.set('type', typeSel.options[typeSel.selectedIndex].text);
      var data = {};
      fd.forEach(function (v, k) { data[k] = v; });
      // Netlify Forms への記録と、メール送信（/api/contact）を同時に行う。
      // どちらか一方が失敗しても、もう一方が成功していればお問い合わせは届いている。
      var record = fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(fd).toString()
      }).then(function (r) { return r.ok; }).catch(function () { return false; });
      var mail = fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
      Promise.all([record, mail]).then(function (res) {
        var recorded = res[0];
        var m = res[1] || {};
        var staffSent = !!m.staffSent;
        var customerSent = !!m.customerSent;
        if (!recorded && !staffSent) throw new Error('both failed');
        if (customerSent) {
          note.textContent = 'お問い合わせを送信しました。受付確認のメールをお送りしましたので、ご確認ください（届かない場合は迷惑メールフォルダもご確認ください）。担当者より折り返しご連絡いたします。';
        } else if (m.reason === 'throttled') {
          note.textContent = 'お問い合わせを送信しました。担当者より折り返しご連絡いたします。';
        } else {
          note.textContent = 'お問い合わせを受け付けました。受付確認メールはお送りできませんでしたが、内容は担当者に届いています。折り返しご連絡いたします。';
        }
        note.className = 'form-note ok';
        form.reset();
        showHint();
      }).catch(function () {
        note.textContent = '送信に失敗しました。お手数ですが、時間をおいて再度お試しください。';
        note.className = 'form-note err';
      }).then(function () {
        if (btn) btn.disabled = false;
      });
    });
  }
})();
