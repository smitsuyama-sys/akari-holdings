/* 光ホールディングス — interactions (multi-page) */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Header shadow on scroll ---
  var header = document.getElementById('siteHeader');
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 20) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

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
      if (href === path) { a.classList.add('active'); a.setAttribute('aria-current', 'page'); }
    });
  })();

  // --- Reveal on scroll ---
  var targets = document.querySelectorAll(
    '.section-head, .message-text, .message-figure, .phi-card, .biz-card, ' +
    '.group-card, .news-item, .recruit-inner, .contact-form, .contact-info, ' +
    '.navcard, .rp-card, .info-table, .cta-inner, [data-reveal]'
  );
  targets.forEach(function (el, i) {
    if (!el.classList.contains('reveal')) el.classList.add('reveal');
    // stagger within sibling groups
    var delay = (i % 4) * 0.09;
    el.style.transitionDelay = delay.toFixed(2) + 's';
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

  // --- Page transition on internal navigation ---
  if (!reduceMotion) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href) return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (/^(#|mailto:|tel:|https?:)/.test(href)) return;       // skip external / anchors
      if (href.indexOf('#') !== -1 && href.split('#')[0] === '') return;
      // internal .html (or directory) link
      if (!/\.html?($|[?#])/.test(href) && href.indexOf('/') === -1) return;
      e.preventDefault();
      document.body.classList.add('is-leaving');
      setTimeout(function () { window.location.href = href; }, 280);
    });
    // restore on back/forward cache
    window.addEventListener('pageshow', function (ev) {
      if (ev.persisted) document.body.classList.remove('is-leaving');
    });
  }

  // --- Contact form (demo: validation + feedback) ---
  var form = document.getElementById('contactForm');
  var note = document.getElementById('formNote');
  if (form && note) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var msg = form.message.value.trim();
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!name || !emailOk || !msg) {
        note.textContent = '必須項目をご確認ください（メールアドレスの形式もご確認ください）。';
        note.className = 'form-note err';
        return;
      }
      note.textContent = '入力ありがとうございます。送信機能は現在デモのため、実装時にメール送信／フォーム連携を設定します。';
      note.className = 'form-note ok';
      form.reset();
    });
  }
})();
