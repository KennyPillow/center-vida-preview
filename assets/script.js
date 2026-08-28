// Center Vida — interações (dinamismo)
document.documentElement.classList.add('js');
document.addEventListener('DOMContentLoaded', function () {
  var WA = '5511954943105';

  // menu mobile
  var burger = document.querySelector('.burger'), nav = document.querySelector('.nav');
  if (burger && nav) burger.addEventListener('click', function () { nav.classList.toggle('open'); });

  // formulário -> WhatsApp
  var form = document.getElementById('cotacao');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault(); var d = new FormData(form);
    var msg = 'Olá! Vim pelo site e quero fazer uma cotação de plano de saúde.%0A%0A'
      + 'Nome: ' + (d.get('nome') || '') + '%0A'
      + 'Telefone: ' + (d.get('telefone') || '') + '%0A'
      + 'Tipo de plano: ' + (d.get('tipo') || '') + '%0A'
      + 'Nº de vidas: ' + (d.get('vidas') || '') + '%0A'
      + 'Mensagem: ' + (d.get('mensagem') || '');
    window.open('https://wa.me/' + WA + '?text=' + msg, '_blank');
  });

  // ---- reveal ao rolar ----
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
    setTimeout(function () { reveals.forEach(function (el) { el.classList.add('in'); }); }, 3200); // fallback de segurança
  } else { reveals.forEach(function (el) { el.classList.add('in'); }); }

  // ---- contadores animados ----
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    var pre = el.getAttribute('data-prefix') || '', suf = el.getAttribute('data-suffix') || '';
    var start = null, dur = 1500;
    function step(t) {
      if (!start) start = t; var p = Math.min((t - start) / dur, 1); var e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + (target * e).toFixed(dec).replace('.', ',') + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var io2 = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { animateCount(x.target); io2.unobserve(x.target); } });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { io2.observe(el); });
  } else { counters.forEach(animateCount); }

  // ---- carrossel(éis) ----
  document.querySelectorAll('.carousel').forEach(function (c) {
    var track = c.querySelector('.track'); if (!track) return;
    var slides = track.children.length; if (slides < 2) return;
    var i = 0, timer;
    var box = c.closest('.carousel-box') || c.parentElement;
    var dots = box.querySelector('.carousel-dots');
    function go(n) {
      i = (n + slides) % slides; track.style.transform = 'translateX(-' + (i * 100) + '%)';
      if (dots) [].forEach.call(dots.children, function (d, k) { d.classList.toggle('on', k === i); });
    }
    var prev = box.querySelector('[data-prev]'), next = box.querySelector('[data-next]');
    if (prev) prev.addEventListener('click', function () { go(i - 1); restart(); });
    if (next) next.addEventListener('click', function () { go(i + 1); restart(); });
    if (dots) [].forEach.call(dots.children, function (d, k) { d.addEventListener('click', function () { go(k); restart(); }); });
    function start() { timer = setInterval(function () { go(i + 1); }, 5500); }
    function restart() { clearInterval(timer); start(); }
    go(0); start();
  });

  // ---- abas (Para Você / Para Empresas) ----
  document.querySelectorAll('[data-tabs]').forEach(function (group) {
    var btns = group.querySelectorAll('.tab-btn');
    var panels = group.querySelectorAll('.tab-panel');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var t = btn.getAttribute('data-tab');
        btns.forEach(function (b) { b.classList.toggle('on', b === btn); });
        panels.forEach(function (pn) { pn.classList.toggle('on', pn.getAttribute('data-panel') === t); });
      });
    });
  });

  // ---- parallax suave ----
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pxEls = [].slice.call(document.querySelectorAll('[data-parallax]'));
  if (!reduce && pxEls.length) {
    var ticking = false;
    function onScroll() {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var vy = window.pageYOffset, vh = window.innerHeight;
        pxEls.forEach(function (el) {
          var host = el.parentElement.getBoundingClientRect();
          var speed = parseFloat(el.getAttribute('data-parallax')) || 0.18;
          var center = host.top + host.height / 2 - vh / 2;
          el.style.transform = 'translate3d(0,' + (-center * speed).toFixed(1) + 'px,0) scale(1.18)';
        });
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }
});
