// Center Vida — protótipo (interações leves)
// marca que o JS assumiu (habilita animação de entrada; sem JS o conteúdo fica visível)
document.documentElement.classList.add('js');
document.addEventListener('DOMContentLoaded', function () {
  var WA = '5511954943105'; // WhatsApp da Center Vida

  // menu mobile
  var burger = document.querySelector('.burger');
  var nav = document.querySelector('.nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  // formulário de cotação -> monta mensagem e abre WhatsApp
  var form = document.getElementById('cotacao');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var msg = 'Olá! Vim pelo site e quero fazer uma cotação de plano de saúde.%0A%0A'
        + 'Nome: ' + (d.get('nome') || '') + '%0A'
        + 'Telefone: ' + (d.get('telefone') || '') + '%0A'
        + 'Tipo de plano: ' + (d.get('tipo') || '') + '%0A'
        + 'Nº de vidas: ' + (d.get('vidas') || '') + '%0A'
        + 'Mensagem: ' + (d.get('mensagem') || '');
      window.open('https://wa.me/' + WA + '?text=' + msg, '_blank');
    });
  }

  // reveal on scroll
  var reveals = document.querySelectorAll('.reveal');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
  reveals.forEach(function (el) { io.observe(el); });
  // fallback de segurança: nada pode ficar invisível
  setTimeout(function () { reveals.forEach(function (el) { el.classList.add('in'); }); }, 2500);
});
