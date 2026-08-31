// Center Vida — interações (dinamismo)
document.documentElement.classList.add('js');
document.addEventListener('DOMContentLoaded', function () {
  var WA = '5511954943105';

  // menu mobile
  var burger = document.querySelector('.burger'), nav = document.querySelector('.nav');
  if (burger && nav) burger.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    document.body.classList.toggle('nav-lock', open); // trava o scroll do fundo
    burger.classList.toggle('is-x', open);
    if (!open) { // ao fechar, recolhe os acordeões abertos
      nav.querySelectorAll('.has-drop.open').forEach(function (d) { d.classList.remove('open'); });
    }
  });

  // acordeão dos dropdowns no mobile (tocar no pai abre a seção em vez de navegar)
  nav && nav.querySelectorAll('.has-drop > a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (window.matchMedia('(max-width:1000px)').matches) {
        e.preventDefault();
        a.parentNode.classList.toggle('open');
      }
    });
  });
  // ao tocar num link real dentro do menu, fecha o menu
  nav && nav.querySelectorAll('a').forEach(function (a) {
    if (a.parentNode.classList.contains('has-drop')) return; // pais são tratados acima
    a.addEventListener('click', function () {
      nav.classList.remove('open');
      document.body.classList.remove('nav-lock');
      burger && burger.classList.remove('is-x');
    });
  });

  // header encolhe/ganha sombra ao rolar
  var header = document.querySelector('.header');
  if (header) {
    var onScrollHeader = function () { header.classList.toggle('scrolled', window.pageYOffset > 12); };
    window.addEventListener('scroll', onScrollHeader, { passive: true });
    onScrollHeader();
  }

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

  // ---- carrossel infinito (loop sem "voltar" brusco) ----
  document.querySelectorAll('.carousel').forEach(function (c) {
    var track = c.querySelector('.track'); if (!track) return;
    var real = track.children.length; if (real < 2) return;
    var clone = track.children[0].cloneNode(true); clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone); // clona a 1ª slide no fim -> transição sempre pra frente
    var i = 0, animating = false, timer;
    var box = c.closest('.carousel-box') || c.parentElement;
    var dots = box.querySelector('.carousel-dots');
    var EASE = 'transform .55s cubic-bezier(.2,.7,.2,1)';
    function setDots() { if (dots) [].forEach.call(dots.children, function (d, k) { d.classList.toggle('on', k === (i % real)); }); }
    function go(n) { i = n; track.style.transition = EASE; track.style.transform = 'translateX(-' + (i * 100) + '%)'; setDots(); }
    track.addEventListener('transitionend', function () {
      if (i >= real) { track.style.transition = 'none'; i = 0; track.style.transform = 'translateX(0)'; void track.offsetWidth; }
      animating = false;
    });
    function next() { if (animating) return; animating = true; go(i + 1); }
    function prev() {
      if (animating) return; animating = true;
      if (i === 0) { track.style.transition = 'none'; i = real; track.style.transform = 'translateX(-' + (real * 100) + '%)'; void track.offsetWidth; }
      go(i - 1);
    }
    var pv = box.querySelector('[data-prev]'), nx = box.querySelector('[data-next]');
    if (nx) nx.addEventListener('click', function () { next(); restart(); });
    if (pv) pv.addEventListener('click', function () { prev(); restart(); });
    if (dots) [].forEach.call(dots.children, function (d, k) { d.addEventListener('click', function () { if (animating) return; animating = true; go(k); restart(); }); });
    function start() { timer = setInterval(next, 5000); }
    function restart() { clearInterval(timer); start(); }
    setDots(); start();
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
