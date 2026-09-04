(() => {
  'use strict';
  const root = document.documentElement;
  const navbar = document.querySelector('.navbar');
  const portrait = document.querySelector('.portrait-wrap');
  const marquee = document.querySelector('.marquee');
  const themeToggle = document.querySelector('#themeToggle');
  const mobileMenu = document.querySelector('#navbarMenu');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelector('#year').textContent = new Date().getFullYear();
  function setTheme(theme) {
    const light = theme === 'light';
    root.dataset.theme = light ? 'light' : 'dark';
    root.setAttribute('data-bs-theme', light ? 'light' : 'dark');
    themeToggle.setAttribute('aria-pressed', String(light));
    themeToggle.setAttribute('aria-label', light ? 'Aktifkan tema gelap' : 'Aktifkan tema terang');
  }
  setTheme(localStorage.getItem('dsp-theme') === 'light' ? 'light' : 'dark');
  themeToggle.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('dsp-theme', next);
  });
  let ticking = false;
  function updateScrollEffects() {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 30);
    if (!reduceMotion.matches && portrait) {
      const progress = Math.min(y / Math.max(window.innerHeight * .9, 1), 1);
      const mobile = window.innerWidth < 768;
      portrait.style.transform = `translate3d(0, ${mobile ? -progress * 20 : -progress * 72}px, 0) scale(${1 - progress * (mobile ? .025 : .075)})`;
      portrait.style.opacity = String(1 - progress * .94);
      marquee.style.setProperty('--scroll-shift', `${progress * -8}vw`);
    }
    ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(updateScrollEffects); ticking = true; } }, { passive: true });
  window.addEventListener('resize', updateScrollEffects, { passive: true });
  updateScrollEffects();
  document.querySelectorAll('#navbarMenu .nav-link').forEach(link => link.addEventListener('click', () => {
    if (mobileMenu.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(mobileMenu).hide();
  }));
  if (window.AOS) AOS.init({ duration: 720, easing: 'ease-out-cubic', once: true, offset: 70, disable: reduceMotion.matches });
})();
