(function () {
  'use strict';
  var root = document.documentElement;
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var header = document.querySelector('.site-header');
  var hero = document.querySelector('.hero');
  var story = document.querySelector('.story');
  var dishes = [].slice.call(document.querySelectorAll('.dish'));
  var navBtns = [].slice.call(document.querySelectorAll('.story-nav button'));
  var parallax = [].slice.call(document.querySelectorAll('[data-parallax]'));
  var masks = [].slice.call(document.querySelectorAll('[data-reveal]'));
  var vh = window.innerHeight;
  var ticking = false;

  /* Pinned story only when motion is welcome and sticky is supported */
  function setMode() {
    var pin = !mq.matches && window.CSS && CSS.supports('position', 'sticky');
    root.classList.toggle('pinned', pin);
    if (story) story.style.setProperty('--n', dishes.length);
    if (!pin) {
      dishes.forEach(function (d) { d.classList.remove('on', 'seen'); });
      parallax.forEach(function (p) { p.style.transform = ''; });
    }
    update();
  }

  /* Mask reveals */
  if ('IntersectionObserver' in window && !mq.matches) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.2 });
    masks.forEach(function (m) { io.observe(m); });
  } else {
    masks.forEach(function (m) { m.classList.add('in'); });
  }

  function update() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;

    /* header turns solid once the hero logo has scrolled away */
    if (header && hero) header.classList.toggle('solid', y > hero.offsetHeight * 0.45);

    /* pinned story */
    if (story && root.classList.contains('pinned')) {
      var r = story.getBoundingClientRect();
      var span = story.offsetHeight - vh;
      var idx = -1;
      if (r.top < vh * 0.6) {
        var p = Math.min(1, Math.max(0, -r.top / span));
        idx = Math.min(dishes.length - 1, Math.floor(p * dishes.length));
      }
      dishes.forEach(function (d, i) {
        d.classList.toggle('seen', i <= idx);
        d.classList.toggle('on', i === idx);
      });
      navBtns.forEach(function (b, i) { b.classList.toggle('on', i === idx); });
    }

    /* parallax: photos only */
    if (!mq.matches) {
      parallax.forEach(function (el) {
        var b = el.parentNode.getBoundingClientRect();
        if (b.bottom < -100 || b.top > vh + 100) return;
        var t = b.top + b.height / 2 - vh / 2;
        el.style.transform = 'translate3d(0,' + (-t * 0.12).toFixed(1) + 'px,0)';
      });
    }
  }

  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { vh = window.innerHeight; onScroll(); });
  if (mq.addEventListener) mq.addEventListener('change', setMode);

  navBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var i = +b.getAttribute('data-go');
      var top = story.getBoundingClientRect().top + window.scrollY;
      var span = story.offsetHeight - vh;
      window.scrollTo({ top: top + ((i + 0.5) / dishes.length) * span, behavior: mq.matches ? 'auto' : 'smooth' });
    });
  });

  /* Mobile drawer */
  var burger = document.querySelector('.burger');
  var drawer = document.getElementById('drawer');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    drawer.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  burger.addEventListener('click', function () { setMenu(drawer.hidden); });
  drawer.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !drawer.hidden) { setMenu(false); burger.focus(); } });
  window.matchMedia('(min-width: 800px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });

  setMode();
})();
