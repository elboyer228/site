/* global gsap, ScrollTrigger */

// ── Hero mouse-trail ─────────────────────────────────────────
(function () {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';
  const inner = hero.querySelector('.hero-inner');
  if (inner) { inner.style.position = 'relative'; inner.style.zIndex = '2'; }
  hero.insertBefore(canvas, hero.firstChild);

  const ctx = canvas.getContext('2d');
  let W, H;
  const trail = []; // { x, y, t }
  const DURATION = 460; // ms before a point expires

  function resize() {
    W = canvas.width = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  hero.addEventListener('mousemove', (e) => {
    const r = hero.getBoundingClientRect();
    trail.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() });
  });

  hero.addEventListener('mouseleave', () => (trail.length = 0));

  (function loop() {
    const now = performance.now();
    // Drop expired points from the tail
    while (trail.length > 0 && now - trail[0].t > DURATION) trail.shift();

    ctx.clearRect(0, 0, W, H);

    if (trail.length > 1) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const head = trail[trail.length - 1];
      const tail = trail[0];

      // Build path once for glow layer
      ctx.beginPath();
      ctx.moveTo(tail.x, tail.y);
      for (let i = 1; i < trail.length; i++) ctx.lineTo(trail[i].x, trail[i].y);
      const glowGrad = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
      glowGrad.addColorStop(0, 'rgba(236,72,153,0)');
      glowGrad.addColorStop(1, 'rgba(236,72,153,0.38)');
      ctx.strokeStyle = glowGrad;
      ctx.lineWidth = 24;
      ctx.stroke();

      // Build path once for the bright core
      ctx.beginPath();
      ctx.moveTo(tail.x, tail.y);
      for (let i = 1; i < trail.length; i++) ctx.lineTo(trail[i].x, trail[i].y);
      const coreGrad = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
      coreGrad.addColorStop(0, 'rgba(255,160,210,0)');
      coreGrad.addColorStop(1, 'rgba(255,200,230,0.95)');
      ctx.strokeStyle = coreGrad;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    requestAnimationFrame(loop);
  })();
})();
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────

(function () {
  if (typeof gsap === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  // ── Nav pill slide down ───────────────────────────────────────
  gsap.from('.sidebar', {
    y: -30, opacity: 0, duration: 0.7, ease: 'power3.out', delay: 0.2
  });

  // ── Hero ─────────────────────────────────────────────────────
  gsap.from('.hero-title', {
    y: 40, opacity: 0, duration: 1.0, ease: 'power3.out', delay: 0.5
  });
  gsap.from('.hero-sub', {
    y: 28, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.72
  });
  gsap.from('.hero-visual', {
    scale: 0.88, opacity: 0, duration: 1.1, ease: 'power3.out', delay: 0.88
  });

  // Smooth scroll on sidebar clicks
  document.querySelectorAll('.sections [data-target] a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = link.getAttribute('href');
      const el = document.querySelector(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Toggle details in Projects cards
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.project-more');
    if (!btn) return;
    const container = e.target.closest('.project-card, .project-item');
    if (container) container.classList.toggle('expanded');
  });

  // Projects filter bar
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    const filter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b === btn));
    document.querySelectorAll('.projects-container .project-item').forEach(item => {
      const cats = (item.dataset.cats || '').split(/\s+/);
      const show = filter === 'all' || cats.includes(filter);
      item.style.display = show ? '' : 'none';
    });
  });

  const sections = gsap.utils.toArray('.section');
  const navItems = gsap.utils.toArray('.sections .nav-item');

  function setActive(targetId) {
    navItems.forEach((item) => {
      item.classList.toggle('active', item.dataset.target === targetId);
    });
    // When on the hero, reset accent to default pink and bail
    if (!targetId) {
      document.documentElement.style.setProperty('--active', '#e879f9');
      return;
    }
    // Update global accent color based on the active section
    const sectionEl = document.getElementById(targetId);
    let color = '';
    if (sectionEl) {
      color = getComputedStyle(sectionEl).getPropertyValue('--section-accent').trim();
    }
    if (!color) {
      const nav = navItems.find((n) => n.dataset.target === targetId);
      color = nav?.dataset.color || '';
    }
    if (color) {
      document.documentElement.style.setProperty('--active', color);
    }
  }

  // ── Nav highlight per section ─────────────────────────────────
  sections.forEach((section) => {
    const id = section.getAttribute('id');
    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => setActive(id),
      onEnterBack: () => setActive(id)
    });
  });

  // Clear highlight when scrolling back up to the hero
  ScrollTrigger.create({
    trigger: '.hero',
    start: 'top center',
    end: 'bottom center',
    onEnter: () => setActive(null),
    onEnterBack: () => setActive(null)
  });

  // ── Projects grid — batch reveal ─────────────────────────────
  const projectItems = '.projects-container .project-item';
  if (document.querySelector(projectItems)) {
    gsap.set(projectItems, { y: 28, opacity: 0 });
    ScrollTrigger.batch(projectItems, {
      start: 'top 88%',
      onEnter: (els) => gsap.to(els, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', stagger: 0.1 }),
      once: true
    });
  }

  // On load the hero is visible — no nav item should be highlighted
  setActive(null);

  // ── AOS init ─────────────────────────────────────────────────
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 850,
      easing: 'ease-out-cubic',
      once: false,
      offset: 80,
      anchorPlacement: 'top-bottom',
    });
  }
})();



