/* 光ホールディングス — interactions */
(function () {
  'use strict';

  // --- Header shadow on scroll ---
  var header = document.getElementById('siteHeader');
  function onScroll() {
    if (window.scrollY > 20) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- Mobile menu toggle ---
  var toggle = document.getElementById('menuToggle');
  var nav = document.getElementById('gnav');
  function closeMenu() {
    nav.classList.remove('open');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
  }
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  // --- Reveal on scroll ---
  var targets = document.querySelectorAll(
    '.section-head, .message-text, .message-figure, .phi-card, .biz-card, .group-card, .news-item, .recruit-inner, .contact-form, .contact-info'
  );
  targets.forEach(function (el, i) {
    el.classList.add('reveal');
    el.style.transitionDelay = (i % 4) * 0.08 + 's';
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add('visible'); });
  }

  // --- Contact form (demo: validation + mailto fallback) ---
  var form = document.getElementById('contactForm');
  var note = document.getElementById('formNote');
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
})();
