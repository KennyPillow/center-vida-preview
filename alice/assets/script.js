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

  // hero slider (fundo dinâmico com fade)
  var hs = document.querySelectorAll('.hero-slider .bg');
  if (hs.length > 1 && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    var hi = 0;
    setInterval(function () {
      hs[hi].classList.remove('on');
      hi = (hi + 1) % hs.length;
      hs[hi].classList.add('on');
    }, 5000);
  }

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

  // ---- QUIZ de conversão (passos condicionais + inputs + WhatsApp + e-mail) ----
  (function () {
    var quiz = document.getElementById('quiz');
    if (!quiz) return;
    var allSteps = [].slice.call(quiz.querySelectorAll('.quiz-step'));
    var result = quiz.querySelector('.quiz-result');
    var bar = quiz.querySelector('.quiz-bar i');
    var back = quiz.querySelector('.quiz-back');
    var countB = quiz.querySelector('.quiz-count b');
    var countWrap = quiz.querySelector('.quiz-count');
    var wa = quiz.getAttribute('data-wa') || '5511954943105';
    var email = quiz.getAttribute('data-email') || '';
    var answers = {};
    var history = [];
    var cur = -1;

    function condOK(step) {
      var c = step.getAttribute('data-cond');
      if (!c) return true;
      if (c === 'multi') return !/Só eu/.test(answers.vidas || '');
      if (c === 'empresa') return /empresa|PME/i.test(answers.para || '');
      return true;
    }
    function applicable() { return allSteps.filter(condOK); }
    function nextFrom(i) { for (var k = i + 1; k < allSteps.length; k++) { if (condOK(allSteps[k])) return k; } return -1; }
    function firstIdx() { for (var k = 0; k < allSteps.length; k++) { if (condOK(allSteps[k])) return k; } return -1; }

    function render(i) {
      allSteps.forEach(function (s, k) { s.classList.toggle('on', k === i); });
      result.classList.remove('on');
      cur = i;
      var appl = applicable(), pos = appl.indexOf(allSteps[i]), total = appl.length;
      bar.style.width = Math.round(((pos + 1) / (total + 1)) * 100) + '%';
      if (countB) countB.textContent = (pos + 1) + '/' + total;
      countWrap.style.visibility = 'visible';
      back.hidden = history.length === 0;
      var inp = allSteps[i].querySelector('.quiz-field');
      if (inp) setTimeout(function () { try { inp.focus(); } catch (e) {} }, 60);
    }
    function go(i) { if (i < 0) { finish(); return; } history.push(cur); render(i); }

    function labels() { return { para: 'Para quem', situacao: 'Situação', vidas: 'Nº de vidas', idade: 'Idade do titular', idadeDep: 'Idade dos dependentes', regiao: 'Região', hospital: 'Hospital preferido', cnpj: 'CNPJ', nome: 'Nome', email: 'E-mail', telefone: 'Telefone/WhatsApp' }; }
    function dataLines() {
      var order = ['nome', 'email', 'telefone', 'para', 'situacao', 'vidas', 'idade', 'idadeDep', 'regiao', 'hospital', 'cnpj'];
      var L = labels(), out = [];
      order.forEach(function (k) { if (answers[k]) out.push(L[k] + ': ' + answers[k]); });
      return out;
    }
    function suggest() {
      var para = answers.para || '', idade = answers.idade || '', dep = answers.idadeDep || '', sit = answers.situacao || '', vidas = answers.vidas || '';
      var sug = [], reason = '';
      if (/empresa|PME/i.test(para)) {
        sug = ['Plano PME']; if (/Mais de 10/.test(vidas)) sug.push('Plano Empresarial');
        sug.push('Odontológico como benefício');
        reason = 'Com CNPJ, o plano PME/empresarial costuma ter melhor custo por vida que o individual.';
      } else if (/adesão/i.test(para)) {
        sug = ['Plano por Adesão', 'Plano Individual / Familiar'];
        reason = 'Pela sua entidade de classe, o plano por adesão tende a sair mais em conta.';
      } else if (/família/i.test(para)) {
        sug = ['Plano Individual / Familiar'];
        if (/60|idoso/i.test(dep)) sug.push('Plano Sênior (60+) p/ o dependente idoso');
        reason = 'Um plano familiar cobre todos num contrato só; ajustamos a rede ao perfil das idades.';
      } else {
        if (/60/.test(idade)) { sug = ['Plano Sênior (60+)', 'Plano Individual / Familiar']; reason = 'Acima dos 60, o plano sênior costuma ter a melhor relação custo × cobertura.'; }
        else { sug = ['Plano Individual / Familiar']; reason = 'Para uso individual, comparamos as operadoras e achamos o melhor custo × rede.'; }
      }
      if (/reduzir|trocar/i.test(sit)) sug.push('Portabilidade (aproveita carências)');
      if (/top|Einstein/i.test(answers.hospital || '')) reason += ' Vamos priorizar operadoras com Einstein/Sírio na rede.';
      sug = sug.filter(function (v, i, a) { return a.indexOf(v) === i; }).slice(0, 4);
      return { sug: sug, reason: reason };
    }

    function finish() {
      allSteps.forEach(function (s) { s.classList.remove('on'); });
      result.classList.add('on'); bar.style.width = '100%';
      countWrap.style.visibility = 'hidden'; back.hidden = false;
      var r = suggest();
      quiz.querySelector('.quiz-chips').innerHTML = r.sug.map(function (s) { return '<span>' + s + '</span>'; }).join('');
      quiz.querySelector('.quiz-reason').textContent = r.reason;
      var text = 'Olá! Fiz o quiz no site da Center Vida e quero uma cotação.\n\n' + dataLines().join('\n') + '\n\nSugestão do site: ' + r.sug.join(', ');
      var link = quiz.querySelector('.quiz-wa');
      if (link) link.href = 'https://wa.me/' + wa + '?text=' + encodeURIComponent(text);
    }

    // cliques nas opções (auto-avança)
    quiz.querySelectorAll('.quiz-step[data-type="choice"] .quiz-opt').forEach(function (opt) {
      opt.addEventListener('click', function () {
        var step = opt.closest('.quiz-step'), key = step.getAttribute('data-key');
        answers[key] = opt.getAttribute('data-value');
        step.querySelectorAll('.quiz-opt').forEach(function (o) { o.classList.remove('sel'); });
        opt.classList.add('sel');
        setTimeout(function () { go(nextFrom(cur)); }, 170);
      });
    });
    // passos com inputs (Continuar)
    quiz.querySelectorAll('.quiz-step[data-type="input"] .quiz-next').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var step = btn.closest('.quiz-step');
        var fields = [].slice.call(step.querySelectorAll('.quiz-field')), ok = true, msg = '';
        fields.forEach(function (f) {
          var v = (f.value || '').trim(), name = f.getAttribute('data-name'), bad = false;
          if (f.hasAttribute('required') && !v) { bad = true; msg = 'Preencha todos os campos para continuar.'; }
          else if (f.type === 'email' && v && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { bad = true; msg = 'Informe um e-mail válido.'; }
          else if (name === 'telefone' && f.hasAttribute('required') && v.replace(/\D/g, '').length < 10) { bad = true; msg = 'Informe um WhatsApp válido com DDD.'; }
          f.classList.toggle('err', bad); if (bad) ok = false;
          answers[name] = v;
        });
        var errEl = step.querySelector('.quiz-err');
        if (!ok) {
          if (!errEl) { errEl = document.createElement('p'); errEl.className = 'quiz-err'; btn.parentNode.insertBefore(errEl, btn); }
          errEl.textContent = msg;
          var firstBad = step.querySelector('.quiz-field.err'); if (firstBad) firstBad.focus();
          return;
        }
        if (errEl) errEl.textContent = '';
        go(nextFrom(cur));
      });
    });
    back.addEventListener('click', function () {
      if (result.classList.contains('on')) { render(cur); return; }
      var prev = history.pop(); if (prev != null && prev >= 0) render(prev);
    });

    // envio por e-mail (FormSubmit) — dispara os dados pra Center Vida
    var emailBtn = quiz.querySelector('.quiz-email');
    if (emailBtn) emailBtn.addEventListener('click', function () {
      var btn = this; if (btn.disabled) return; btn.disabled = true; btn.textContent = 'Enviando...';
      var r = suggest();
      var payload = { _subject: 'Nova cotação pelo site (quiz) — ' + (answers.nome || 'sem nome'), _template: 'table' };
      var L = labels();
      Object.keys(answers).forEach(function (k) { if (L[k]) payload[L[k]] = answers[k]; });
      payload['Sugestão do site'] = r.sug.join(', ');
      function done() { btn.hidden = true; var s = quiz.querySelector('.quiz-sent'); if (s) s.hidden = false; }
      if (!email) { done(); return; }
      fetch('https://formsubmit.co/ajax/' + email, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload)
      }).then(function (res) { return res.json(); }).then(function () { done(); })
        .catch(function () {
          // fallback: abre o e-mail já preenchido
          window.location.href = 'mailto:' + email + '?subject=' + encodeURIComponent('Cotação pelo site — ' + (answers.nome || '')) + '&body=' + encodeURIComponent(dataLines().join('\n') + '\n\nSugestão: ' + r.sug.join(', '));
          done();
        });
    });

    render(firstIdx());
  })();

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
