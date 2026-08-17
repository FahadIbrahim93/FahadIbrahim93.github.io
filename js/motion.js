/**
 * motion.js — interaction & motion layer for fahadibrahim93.github.io
 * Custom cursor, magnetic buttons, 3D tilt+glare cards, animated counters,
 * scroll progress bar, staggered reveals. All vanilla, all guarded:
 * - prefers-reduced-motion: everything disabled
 * - touch devices: cursor/magnetic/tilt skipped (no hover semantics)
 * - no-JS: page renders fully static (html.js gate)
 */
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------- Scroll progress bar ---------- */
  const progress = document.getElementById('scroll-progress');
  if (progress) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
        progress.style.transform = 'scaleX(' + (pct / 100).toFixed(4) + ')';
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Staggered reveals (upgrade over base reveal) ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        // Stagger siblings that enter together
        const parent = el.parentElement;
        const siblings = parent ? Array.from(parent.querySelectorAll('.reveal:not(.visible)')) : [el];
        const idx = siblings.indexOf(el);
        el.style.transitionDelay = Math.max(0, idx) * 90 + 'ms';
        el.classList.add('visible');
        io.unobserve(el);
        // Clear delay after transition so hovers aren't laggy
        setTimeout(() => { el.style.transitionDelay = ''; }, 900);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const fmt = (el, v) => {
      const suffix = el.dataset.suffix || '';
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      el.textContent = v.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
    };
    const animate = (el) => {
      const target = parseFloat(el.dataset.count);
      if (reduced || isNaN(target)) { fmt(el, target || 0); return; }
      const dur = 1400;
      const start = performance.now();
      const ease = (x) => 1 - Math.pow(1 - x, 3); // easeOutCubic
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        fmt(el, target * ease(p));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { animate(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach((el) => cio.observe(el));
  }

  /* ---------- Custom cursor (desktop, fine pointer only) ---------- */
  if (finePointer && !reduced) {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (dot && ring) {
      document.documentElement.classList.add('has-cursor');
      let mx = -100, my = -100, rx = -100, ry = -100;
      window.addEventListener('pointermove', (e) => {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
      }, { passive: true });
      (function loop() {
        rx += (mx - rx) * 0.16;
        ry += (my - ry) * 0.16;
        ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
        requestAnimationFrame(loop);
      })();
      // Grow ring over interactive elements
      document.querySelectorAll('a, button, .project-card, .contact-card').forEach((el) => {
        el.addEventListener('pointerenter', () => ring.classList.add('cursor-hover'));
        el.addEventListener('pointerleave', () => ring.classList.remove('cursor-hover'));
      });
    }
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduced) {
    document.querySelectorAll('.btn, .nav-cta').forEach((btn) => {
      const strength = 0.28;
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        btn.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ---------- 3D tilt + glare on project cards ---------- */
  if (finePointer && !reduced) {
    document.querySelectorAll('.project-card').forEach((card) => {
      const glare = card.querySelector('.card-glare');
      let raf = null;
      card.addEventListener('pointermove', (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          const rotY = (px - 0.5) * 10;   // max 5deg
          const rotX = (0.5 - py) * 8;    // max 4deg
          card.style.transform =
            'perspective(900px) rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg) translateY(-4px)';
          if (glare) {
            glare.style.background =
              'radial-gradient(circle at ' + (px * 100).toFixed(1) + '% ' + (py * 100).toFixed(1) + '%, rgba(0,240,255,0.14), transparent 55%)';
            glare.style.opacity = '1';
          }
          raf = null;
        });
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
        if (glare) glare.style.opacity = '0';
      });
    });
  }

  /* ---------- Nav active-section highlight ---------- */
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (navLinks.length) {
    const sections = Array.from(navLinks)
      .map((a) => document.querySelector(a.getAttribute('href')))
      .filter(Boolean);
    const sio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((a) =>
          a.classList.toggle('nav-active', a.getAttribute('href') === '#' + e.target.id));
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach((s) => sio.observe(s));
  }
})();
