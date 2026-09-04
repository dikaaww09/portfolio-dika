(() => {
  "use strict";

  const root = document.documentElement;
  const navbar = document.querySelector("#mainNav");
  const navMenu = document.querySelector("#navbarMenu .nav-menu");
  const navItems = [...document.querySelectorAll("#navbarMenu .nav-item")];
  const navLinks = navItems.map((item) => item.querySelector(".nav-link"));
  const indicator = document.querySelector(".nav-indicator");
  const portrait = document.querySelector(".portrait-wrap");
  const portraitImage = document.querySelector("#heroPortrait");
  const marquee = document.querySelector(".marquee");
  const themeToggle = document.querySelector("#themeToggle");
  const mobileMenu = document.querySelector("#navbarMenu");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const sectionIds = ["beranda", "perkenalan", "tentang", "keahlian", "proyek", "kontak"];
  const visibleSections = new Map();

  document.querySelector("#year").textContent = new Date().getFullYear();

  function setTheme(theme) {
    const isLight = theme === "light";

    root.dataset.theme = isLight ? "light" : "dark";
    root.setAttribute("data-bs-theme", isLight ? "light" : "dark");
    themeToggle.setAttribute("aria-pressed", String(isLight));
    themeToggle.setAttribute("aria-label", isLight ? "Aktifkan tema gelap" : "Aktifkan tema terang");
  }

  function moveIndicator(activeLink) {
    if (!activeLink || !navMenu || !indicator) return;

    const menuRect = navMenu.getBoundingClientRect();
    const itemRect = activeLink.getBoundingClientRect();
    const offsetX = itemRect.left - menuRect.left;
    const offsetY = itemRect.top - menuRect.top;

    indicator.style.width = `${itemRect.width}px`;
    indicator.style.height = `${itemRect.height}px`;
    indicator.style.opacity = "1";
    indicator.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
  }

  function setActiveSection(sectionId) {
    const navigationId = sectionId === "perkenalan" ? "beranda" : sectionId;
    const activeLink = navLinks.find((link) => link.hash === `#${navigationId}`);

    if (!activeLink) return;

    navLinks.forEach((link) => {
      const isActive = link === activeLink;
      link.classList.toggle("active", isActive);

      if (isActive) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    moveIndicator(activeLink);
  }

  function chooseActiveSection() {
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 3) {
      setActiveSection("kontak");
      return;
    }

    const focusLine = window.innerHeight * 0.34;
    const candidates = [...visibleSections.entries()]
      .filter(([, entry]) => entry.isIntersecting)
      .map(([id, entry]) => ({
        id,
        distance: Math.abs(entry.boundingClientRect.top - focusLine),
      }))
      .sort((a, b) => a.distance - b.distance);

    if (candidates.length) setActiveSection(candidates[0].id);
  }

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => visibleSections.set(entry.target.id, entry));
      chooseActiveSection();
    },
    {
      rootMargin: "-18% 0px -52% 0px",
      threshold: [0, 0.15, 0.35, 0.6],
    },
  );

  sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean)
    .forEach((section) => sectionObserver.observe(section));

  navItems.forEach((item) => {
    const link = item.querySelector(".nav-link");

    item.addEventListener("mouseenter", () => moveIndicator(link));
    item.addEventListener("click", () => {
      setActiveSection(link.hash.slice(1));

      if (mobileMenu.classList.contains("show")) {
        bootstrap.Collapse.getOrCreateInstance(mobileMenu).hide();
      }
    });
  });

  navMenu.addEventListener("mouseleave", () => {
    moveIndicator(document.querySelector("#navbarMenu .nav-link.active"));
  });

  document.querySelectorAll('a[href="#beranda"]').forEach((link) => {
    if (!link.classList.contains("nav-link")) {
      link.addEventListener("click", () => setActiveSection("beranda"));
    }
  });

  mobileMenu.addEventListener("shown.bs.collapse", () => {
    moveIndicator(document.querySelector("#navbarMenu .nav-link.active"));
  });

  let ticking = false;

  function updateScrollEffects() {
    const progress = Math.min(window.scrollY / Math.max(window.innerHeight * 0.9, 1), 1);
    const isMobile = window.innerWidth < 768;

    navbar.classList.toggle("scrolled", window.scrollY > 30);

    if (!reducedMotion.matches && portrait && portraitImage && marquee) {
      portrait.style.setProperty("--portrait-opacity", String(1 - progress * 0.94));
      portraitImage.style.setProperty("--portrait-y", `${isMobile ? -progress * 20 : -progress * 72}px`);
      portraitImage.style.setProperty("--portrait-scale", String(1 - progress * (isMobile ? 0.025 : 0.075)));
      marquee.style.setProperty("--scroll-shift", `${progress * -8}vw`);
    }

    ticking = false;
  }

  function requestScrollUpdate() {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollEffects);
      ticking = true;
    }
  }

  function refreshLayout() {
    window.requestAnimationFrame(() => {
      moveIndicator(document.querySelector("#navbarMenu .nav-link.active"));
      chooseActiveSection();
      updateScrollEffects();
    });
  }

  setTheme(localStorage.getItem("dsp-theme") === "light" ? "light" : "dark");
  setActiveSection("beranda");

  themeToggle.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("dsp-theme", nextTheme);
  });

  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", refreshLayout, { passive: true });
  window.addEventListener("load", refreshLayout, { once: true });
  reducedMotion.addEventListener?.("change", refreshLayout);
  updateScrollEffects();

  if (window.AOS) {
    AOS.init({
      duration: 720,
      easing: "ease-out-cubic",
      once: true,
      offset: 70,
      disable: reducedMotion.matches,
    });
  }
})();
