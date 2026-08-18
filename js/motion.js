/**
 * motion.js — interaction layer for fahadibrahim93.github.io
 * Custom cursor, magnetic buttons, spring-physics 3D tilt+glare cards.
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

  /* ---------- Spring physics helper ---------- */
  function createSpring(stiffness, damping) {
    let current = 0;
    let target = 0;
    let velocity = 0;
    let raf = null;
    let ticking = false;

    return {
      set(v) { target = v; },
      to(v) { target = v; current = v; velocity = 0; },
      value() { return current; },
      start() {
        if (ticking) return;
        ticking = true;
        (function loop() {
          velocity += (target - current) * stiffness;
          velocity *= damping;
          current += velocity;
          if (Math.abs(target - current) < 0.001 && Math.abs(velocity) < 0.001) {
            current = target;
            velocity = 0;
            ticking = false;
            return;
          }
          raf = requestAnimationFrame(loop);
        })();
      },
      stop() {
        if (raf) cancelAnimationFrame(raf);
        ticking = false;
      },
    };
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
      document.querySelectorAll('a, button, .project-card, .contact-card').forEach((el) => {
        el.addEventListener('pointerenter', () => ring.classList.add('cursor-hover'));
        el.addEventListener('pointerleave', () => ring.classList.remove('cursor-hover'));
      });
    }
  }

  /* ---------- Magnetic buttons with spring return ---------- */
  if (finePointer && !reduced) {
    document.querySelectorAll('.btn, .nav-cta').forEach((btn) => {
      const springX = createSpring(0.18, 0.75);
      const springY = createSpring(0.18, 0.75);
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const tx = (e.clientX - r.left - r.width / 2) * 0.28;
        const ty = (e.clientY - r.top - r.height / 2) * 0.28;
        springX.set(tx);
        springY.set(ty);
        springX.start();
        springY.start();
      });
      btn.addEventListener('pointerleave', () => {
        springX.to(0);
        springY.to(0);
        springX.start();
        springY.start();
      });
      (function loop() {
        btn.style.transform = 'translate(' + springX.value().toFixed(1) + 'px,' + springY.value().toFixed(1) + 'px)';
        requestAnimationFrame(loop);
      })();
    });
  }

  /* ---------- Spring-physics 3D tilt + glare on project cards ---------- */
  if (finePointer && !reduced) {
    document.querySelectorAll('.project-card').forEach((card) => {
      const glare = card.querySelector('.card-glare');
      const springRotX = createSpring(0.12, 0.78);
      const springRotY = createSpring(0.12, 0.78);
      const springGlareX = createSpring(0.12, 0.78);
      const springGlareY = createSpring(0.12, 0.78);
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        springRotY.set((px - 0.5) * 18);
        springRotX.set((0.5 - py) * 18);
        springGlareX.set(px * 100);
        springGlareY.set(py * 100);
        springRotX.start();
        springRotY.start();
        springGlareX.start();
        springGlareY.start();
      });
      card.addEventListener('pointerleave', () => {
        springRotX.to(0);
        springRotY.to(0);
        springGlareX.to(50);
        springGlareY.to(50);
        springRotX.start();
        springRotY.start();
        springGlareX.start();
        springGlareY.start();
      });
      (function loop() {
        const rx = springRotX.value();
        const ry = springRotY.value();
        const gx = springGlareX.value();
        const gy = springGlareY.value();
        card.style.transform =
          'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-4px)';
        if (glare) {
          glare.style.background =
            'radial-gradient(circle at ' + gx.toFixed(1) + '% ' + gy.toFixed(1) + '%, rgba(255,255,255,0.08), transparent 55%)';
          glare.style.opacity = '1';
        }
        requestAnimationFrame(loop);
      })();
    });
  }

  /* ---------- Spring-physics hover on contact cards ---------- */
  if (finePointer && !reduced) {
    document.querySelectorAll('.contact-card').forEach((card) => {
      const springX = createSpring(0.14, 0.76);
      const springY = createSpring(0.14, 0.76);
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const tx = (e.clientX - r.left - r.width / 2) * 0.18;
        const ty = (e.clientY - r.top - r.height / 2) * 0.18;
        springX.set(tx);
        springY.set(ty);
        springX.start();
        springY.start();
      });
      card.addEventListener('pointerleave', () => {
        springX.to(0);
        springY.to(0);
        springX.start();
        springY.start();
      });
      (function loop() {
        card.style.transform = 'translateY(-3px) translate(' + springX.value().toFixed(1) + 'px,' + springY.value().toFixed(1) + 'px)';
        requestAnimationFrame(loop);
      })();
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
