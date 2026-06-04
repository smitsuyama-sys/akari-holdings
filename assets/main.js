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
      if (href === path) { a.classList.add('active'); a.setAttribute('aria-current', 'page'); }
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
