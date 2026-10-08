(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Menú hamburguesa ---------- */
  var hdr = $('.hdr'), burger = $('.hdr-burger');
  if (hdr && burger) {
    var setOpen = function (open) {
      hdr.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    };
    burger.addEventListener('click', function () { setOpen(!hdr.classList.contains('open')); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && hdr.classList.contains('open')) { setOpen(false); burger.focus(); }
    });
    $$('.hdr-nav-mob a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
  }

  /* ---------- Sección activa en el menú ---------- */
  var navLinks = $$('.hdr-nav a[href^="#"]');
  var targets = [];
  navLinks.forEach(function (a) {
    var id = a.getAttribute('href').slice(1), el = id && document.getElementById(id);
    if (el && targets.indexOf(el) < 0) targets.push(el);
  });
  if ('IntersectionObserver' in window && targets.length) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach(function (t) { spy.observe(t); });
    var top = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) navLinks.forEach(function (a) { a.classList.remove('on'); }); });
    }, { rootMargin: '-20% 0px -75% 0px' });
    var hero = document.getElementById('inicio'); if (hero) top.observe(hero);
  }

  /* ---------- Ilustraciones y cifras de resultados ---------- */
  function fmt(el, v) {
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    return (el.getAttribute('data-prefix') || '') + v.toFixed(dec).replace('.', ',') + (el.getAttribute('data-suffix') || '');
  }
  if ('IntersectionObserver' in window) {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target; rio.unobserve(el);
        if (el.classList.contains('rc-anim')) {
          requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('go'); }); });
          return;
        }
        var to = parseFloat(el.getAttribute('data-count'));
        if (reduce) return;
        var t0 = performance.now(), D = 1600;
        el.textContent = fmt(el, 0);
        (function tick(t) {
          var p = Math.min(1, (t - t0) / D), k = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(el, to * k);
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.4 });
    $$('.rc-anim, [data-count]').forEach(function (el) { rio.observe(el); });
  } else {
    $$('.rc-anim').forEach(function (el) { el.classList.add('go'); });
  }

  /* ---------- Preguntas que rotan ---------- */
  var MS = 6000;
  $$('[data-q]').forEach(function (col) {
    var qs = $$('.qq', col), segs = $$('.qsg', col), ct = $('.qct b', col), stage = $('.qstage', col);
    var delay = parseInt(col.getAttribute('data-delay') || '0', 10);
    var i = 0, timer = null, visible = false, hover = false, started = false;
    col.style.setProperty('--qms', MS + 'ms');
    function show(n) {
      var prev = i;
      i = (n + qs.length) % qs.length;
      qs.forEach(function (q, k) { q.classList.toggle('on', k === i); q.classList.toggle('out', k === prev && k !== i); });
      segs.forEach(function (s, k) { s.classList.toggle('on', k === i); s.classList.toggle('done', k < i); });
      if (ct) ct.textContent = String(i + 1);
    }
    function stop() { clearTimeout(timer); timer = null; col.classList.remove('auto'); }
    function schedule() {
      clearTimeout(timer);
      if (reduce || !visible || hover) return;
      col.classList.remove('auto'); void col.offsetWidth; col.classList.add('auto');
      timer = setTimeout(function () { show(i + 1); schedule(); }, MS);
    }
    function go(n) { show(n); schedule(); }
    var nx = $('.qnx', col), pv = $('.qpv', col);
    if (nx) nx.addEventListener('click', function () { go(i + 1); });
    if (pv) pv.addEventListener('click', function () { go(i - 1); });
    stage.addEventListener('click', function () { go(i + 1); });
    stage.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
    });
    segs.forEach(function (s, k) { s.addEventListener('click', function () { go(k); }); });
    col.addEventListener('mouseenter', function () { hover = true; stop(); });
    col.addEventListener('mouseleave', function () { hover = false; schedule(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          visible = e.isIntersecting;
          if (visible && !started) { started = true; setTimeout(function () { if (visible) schedule(); }, delay); }
          else if (visible) schedule(); else stop();
        });
      }, { threshold: 0.35 }).observe(col);
    }
  });

  /* ---------- Beneficios: tarjetas que giran ---------- */
  var benefits = $$('.ben-panel .benefit');
  benefits.forEach(function (b) {
    b.addEventListener('click', function () { b.classList.toggle('flip'); });
    b.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); b.classList.toggle('flip'); }
    });
  });
  var panel = $('.ben-panel');
  if (panel && benefits.length && 'IntersectionObserver' in window && !reduce) {
    var po = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        po.disconnect();
        benefits.forEach(function (b, k) { b.style.setProperty('--pd', (k * 220) + 'ms'); b.classList.add('peek'); });
        setTimeout(function () { benefits.forEach(function (b) { b.classList.remove('peek'); }); }, 2200);
      });
    }, { threshold: 0.5 });
    po.observe(panel);
  }

  /* ---------- Portada: leyenda en móvil ---------- */
  var legend = $$('.lp-legend li');
  if (legend.length && !reduce) {
    var li = legend.length - 1;
    setInterval(function () {
      if (!window.matchMedia('(max-width:680px)').matches || document.hidden) return;
      li = (li + 1) % legend.length;
      legend.forEach(function (n, k) { n.classList.toggle('on', k === li); });
    }, 2400);
  }
})();
