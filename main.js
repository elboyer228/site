/* global gsap, ScrollTrigger */
(function () {
  if (typeof gsap === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  // Hero fade-in on initial load
  gsap.from(['.hero-title', '.hero-sub', '.hero-visual'], {
    y: 18,
    opacity: 0,
    duration: 0.8,
    ease: 'power2.out',
    stagger: 0.12,
    overwrite: 'auto'
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

  // Animate each section's content sliding in on enter
  sections.forEach((section) => {
    const body = section.querySelector('.reveal');
    if (!body) return;
    gsap.from(body, {
      x: 80,
      opacity: 0,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 70%',
        toggleActions: 'play none none reverse'
      }
    });

    // Highlight corresponding nav item while this section is in view
    const id = section.getAttribute('id');
    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => setActive(id),
      onEnterBack: () => setActive(id)
    });
  });

  // Fade-up animation for elements marked as reveal-up (e.g., travel project content)
  const fadeUps = gsap.utils.toArray('.reveal-up');
  fadeUps.forEach((el) => {
    gsap.from(el, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });
  });
  // Projects grid: slide each card in as it enters (stagger by row)
  const projectItems = '.projects-container .project-item';
  if (document.querySelector(projectItems)) {
    gsap.set(projectItems, { y: 24, opacity: 0 });
    ScrollTrigger.batch(projectItems, {
      start: 'top 85%',
      onEnter: (els) =>
        gsap.to(els, {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.12
        }),
      once: true
    });
  }
  // Initialize accent color on load
  const initialTarget =
    document.querySelector('.sections .nav-item.active')?.dataset.target ||
    (sections[0] && sections[0].id);
  if (initialTarget) setActive(initialTarget);
})();



