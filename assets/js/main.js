(function () {
  var root = document.documentElement;
  var langToggle = document.getElementById('langToggle');
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');
  var yearEl = document.getElementById('year');

  var saved = localStorage.getItem('xpwq-lang');
  if (saved === 'zh' || saved === 'en') {
    root.setAttribute('data-lang', saved);
  }

  langToggle.addEventListener('click', function () {
    var current = root.getAttribute('data-lang') === 'en' ? 'en' : 'zh';
    var next = current === 'zh' ? 'en' : 'zh';
    root.setAttribute('data-lang', next);
    localStorage.setItem('xpwq-lang', next);
  });

  navToggle.addEventListener('click', function () {
    var isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  mainNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
