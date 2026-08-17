/**
 * motion.js — interaction layer for fahadibrahim93.github.io
 * Custom cursor, magnetic buttons, 3D tilt+glare cards, nav active-section.
 *
 * NOTE: Scroll progress bar, reveals, and counter animations are now handled
 * by cinematic.js (GSAP + ScrollTrigger). This file focuses on hover/pointer
 * interactions that need direct DOM event binding.
 *
 * Guardrails:
 *   - prefers-reduced-motion: cursor/magnetic/tilt disabled
 *   - touch devices: cursor/magnetic/tilt skipped (no hover semantics)
 *   - no-JS: page renders fully static (html.js gate)
 */
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

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
