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

  if (langToggle) {
    langToggle.addEventListener('click', function () {
      var current = root.getAttribute('data-lang') === 'en' ? 'en' : 'zh';
      var next = current === 'zh' ? 'en' : 'zh';
      root.setAttribute('data-lang', next);
      localStorage.setItem('xpwq-lang', next);
    });
  }

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.classList.toggle('menu-open', isOpen);
    });

    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
      });
    });
  }

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ---------- Hero carousel ----------
  var carousel = document.getElementById('heroCarousel');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var prevBtn = document.getElementById('heroPrevious');
    var nextBtn = document.getElementById('heroNext');
    var autoplayBtn = document.getElementById('heroAutoplay');
    var captionEl = document.getElementById('heroCaption');
    var numberEl = document.getElementById('heroSlideNumber');
    var announceEl = document.getElementById('heroSlideAnnouncement');
    var index = Math.max(0, slides.findIndex(function (s) { return s.classList.contains('is-active'); }));
    if (index < 0) index = 0;
    var timer = null;
    var playing = false;

    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    function render(fromUser) {
      slides.forEach(function (slide, i) {
        var active = i === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      dots.forEach(function (dot, i) {
        var active = i === index;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      var active = slides[index];
      if (active && captionEl) {
        var zh = active.getAttribute('data-caption-zh') || '';
        var en = active.getAttribute('data-caption-en') || '';
        captionEl.innerHTML =
          '<span class="lang-zh">' + zh + '</span><span class="lang-en">' + en + '</span>';
        if (announceEl && fromUser) {
          announceEl.textContent =
            '第 ' + (index + 1) + ' 张，共 ' + slides.length + ' 张：' + zh;
        }
      }
      if (numberEl) numberEl.textContent = pad(index + 1);
    }

    function goTo(i, fromUser) {
      index = (i + slides.length) % slides.length;
      render(fromUser);
    }

    function next(fromUser) { goTo(index + 1, fromUser); }
    function prev(fromUser) { goTo(index - 1, fromUser); }

    function stopAutoplay() {
      playing = false;
      if (timer) { clearInterval(timer); timer = null; }
      if (autoplayBtn) {
        autoplayBtn.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#play"></use></svg>';
        autoplayBtn.setAttribute('aria-label', '开始自动切换 / Start slideshow');
      }
    }

    function startAutoplay() {
      playing = true;
      if (timer) clearInterval(timer);
      timer = setInterval(function () { next(false); }, 4500);
      if (autoplayBtn) {
        autoplayBtn.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#pause"></use></svg>';
        autoplayBtn.setAttribute('aria-label', '暂停自动切换 / Pause slideshow');
      }
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { prev(true); });
    if (nextBtn) nextBtn.addEventListener('click', function () { next(true); });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { goTo(i, true); });
    });
    if (autoplayBtn) {
      autoplayBtn.addEventListener('click', function () {
        if (playing) { stopAutoplay(); } else { startAutoplay(); }
      });
    }

    render(false);
  }

  // ---------- Marquee pause toggle ----------
  var marqueeToggle = document.getElementById('marqueeToggle');
  if (marqueeToggle) {
    var marqueeSection = marqueeToggle.closest('.marquee-section');
    marqueeToggle.addEventListener('click', function () {
      var paused = marqueeSection ? marqueeSection.classList.toggle('is-paused') : false;
      marqueeToggle.setAttribute('aria-pressed', paused ? 'true' : 'false');
      marqueeToggle.setAttribute('aria-label', paused ? '继续照片滚动 / Resume gallery' : '暂停照片滚动 / Pause gallery');
      marqueeToggle.innerHTML = paused
        ? '<svg class="icon" aria-hidden="true"><use href="#play"></use></svg>'
        : '<svg class="icon" aria-hidden="true"><use href="#pause"></use></svg>';
    });
  }

  // ---------- Copy WeChat ID ----------
  var copyBtn = document.querySelector('[data-copy]');
  var copyStatus = document.getElementById('copyStatus');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var value = copyBtn.getAttribute('data-copy') || '';
      var actionEl = copyBtn.querySelector('.contact-action');
      var restore = actionEl ? actionEl.innerHTML : null;

      function showCopied() {
        if (actionEl) {
          actionEl.innerHTML =
            '<span class="lang-zh">已复制微信号 ✓</span><span class="lang-en">Copied ✓</span>';
        }
        if (copyStatus) copyStatus.textContent = '微信号已复制 / WeChat ID copied';
        setTimeout(function () {
          if (actionEl && restore !== null) actionEl.innerHTML = restore;
        }, 2000);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(showCopied, showCopied);
      } else {
        var temp = document.createElement('textarea');
        temp.value = value;
        temp.style.position = 'fixed';
        temp.style.opacity = '0';
        document.body.appendChild(temp);
        temp.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(temp);
        showCopied();
      }
    });
  }
})();
