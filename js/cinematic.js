/**
 * cinematic.js — GSAP + Lenis orchestration layer
 * Upgrades the portfolio from "static reveals" to "scroll-driven cinematic experience."
 *
 * Architecture:
 *   Lenis (smooth scroll) → synced with GSAP ticker
 *   ScrollTrigger → drives section reveals, parallax, text splits
 *   Hero scene ← reads global __scrollProgress for camera path
 *
 * Guardrails (preserved from motion.js):
 *   - prefers-reduced-motion: Lenis disabled, GSAP animations instant, text stays static
 *   - no JS: page renders fully static (html.js gate)
 *   - mobile: Lenis + GSAP run, but heavy parallax effects skipped
 */
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 900;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  // Global scroll progress for hero-scene.js to read (0..1 through hero)
  window.__scrollProgress = 0;

  /* ================================================================
   * 1. LENIS — smooth scroll
   * ================================================================ */
  if (!reduced && window.Lenis) {
    const lenis = new window.Lenis({
      duration: 1.4,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      touchMultiplier: isMobile ? 1.5 : 1,
    });

    // Sync Lenis → GSAP ticker → ScrollTrigger
    lenis.on('scroll', function (e) {
      if (window.ScrollTrigger) window.ScrollTrigger.update();
      // Export normalized scroll progress through the hero section
      var hero = document.querySelector('.hero');
      if (hero) {
        var heroH = hero.offsetHeight;
        window.__scrollProgress = Math.max(0, Math.min(1, e.animatedScroll / heroH));
      }
    });

    if (window.gsap) {
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }

    // Anchor links use Lenis scrollTo
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var target = document.querySelector(a.getAttribute('href'));
        if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -80 }); }
      });
    });

    window.__lenis = lenis;
  } else if (!reduced) {
    // Fallback: still track scroll progress without Lenis
    window.addEventListener('scroll', function () {
      var hero = document.querySelector('.hero');
      if (hero) {
        var heroH = hero.offsetHeight;
        window.__scrollProgress = Math.max(0, Math.min(1, window.scrollY / heroH));
      }
    }, { passive: true });
  }

  /* ================================================================
   * 2. GSAP + SCROLLTRIGGER SETUP
   * ================================================================ */
  if (!window.gsap || !window.ScrollTrigger) return;
  var ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  // Reduced motion: make everything instant
  if (reduced) {
    gsap.globalTimeline.timeScale(100); // effectively instant
  }

  /* ================================================================
   * 3. HERO TEXT SPLIT ANIMATION
   * ================================================================ */
  var heroH1 = document.querySelector('.hero h1');
  if (heroH1 && !reduced) {
    // Split into words while preserving structure
    var text = heroH1.textContent;
    heroH1.innerHTML = '';
    heroH1.setAttribute('aria-label', text);

    var words = text.split(/\s+/);
    words.forEach(function (word, i) {
      var span = document.createElement('span');
      span.className = 'word-reveal';
      span.textContent = word;
      span.style.display = 'inline-block';
      heroH1.appendChild(span);
      if (i < words.length - 1) {
        heroH1.appendChild(document.createTextNode(' '));
      }
    });

    gsap.from('.word-reveal', {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: 'power3.out',
      delay: 0.3,
    });
  }

  /* ================================================================
   * 4. UPGRADED SECTION REVEALS (replaces IntersectionObserver)
   * ================================================================ */
  // Section titles — slide in from left
  gsap.utils.toArray('.section-title').forEach(function (el) {
    gsap.from(el, {
      x: -30,
      opacity: 0,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    });
  });

  // Section headings — fade up
  gsap.utils.toArray('.section h2').forEach(function (el) {
    gsap.from(el, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });

  // Section intros — fade up with delay
  gsap.utils.toArray('.section-intro').forEach(function (el) {
    gsap.from(el, {
      y: 20,
      opacity: 0,
      duration: 0.7,
      delay: 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    });
  });

  /* ================================================================
   * 5. PROJECT CARDS — staggered reveal + parallax depth
   * ================================================================ */
  var cards = gsap.utils.toArray('.project-card');
  if (cards.length) {
    // Staggered entrance
    cards.forEach(function (card, i) {
      gsap.from(card, {
        y: 50,
        opacity: 0,
        scale: 0.97,
        duration: 0.7,
        delay: i % 2 * 0.12, // stagger within row
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      });
    });

    // Subtle parallax on cards (desktop only)
    if (!isMobile && !reduced) {
      cards.forEach(function (card) {
        gsap.to(card, {
          y: -20,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        });
      });
    }
  }

  /* ================================================================
   * 6. HERO STATS — count-up animation driven by GSAP
   * ================================================================ */
  gsap.utils.toArray('[data-count]').forEach(function (el) {
    var target = parseFloat(el.dataset.count);
    if (isNaN(target)) return;
    var suffix = el.dataset.suffix || '';
    var decimals = parseInt(el.dataset.decimals || '0', 10);
    var obj = { val: 0 };

    gsap.to(obj, {
      val: target,
      duration: 1.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      onUpdate: function () {
        el.textContent = obj.val.toFixed(decimals)
          .replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
      },
    });
  });

  /* ================================================================
   * 7. SKILL CATEGORIES — staggered grid reveal
   * ================================================================ */
  var skills = gsap.utils.toArray('.skill-category');
  if (skills.length) {
    gsap.from(skills, {
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.skills-grid',
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  }

  /* ================================================================
   * 8. EXPERIENCE ITEMS — slide in from left
   * ================================================================ */
  gsap.utils.toArray('.experience-item').forEach(function (el) {
    gsap.from(el, {
      x: -20,
      opacity: 0,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    });
  });

  /* ================================================================
   * 9. CONTACT CARDS — scale up stagger
   * ================================================================ */
  var contacts = gsap.utils.toArray('.contact-card');
  if (contacts.length) {
    gsap.from(contacts, {
      scale: 0.92,
      opacity: 0,
      duration: 0.5,
      stagger: 0.06,
      ease: 'back.out(1.4)',
      scrollTrigger: {
        trigger: '.contact-grid',
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  }

  /* ================================================================
   * 10. CASE STUDY BANNER — cinematic entrance
   * ================================================================ */
  var caseBanner = document.querySelector('.case-banner');
  if (caseBanner) {
    gsap.from(caseBanner, {
      y: 40,
      opacity: 0,
      scale: 0.98,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: caseBanner,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  }

  /* ================================================================
   * 11. TICKER — speed variation on scroll
   * ================================================================ */
  var ticker = document.querySelector('.ticker-track');
  if (ticker && !reduced) {
    gsap.to(ticker, {
      x: '-=60',
      ease: 'none',
      scrollTrigger: {
        trigger: '.ticker',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 2,
      },
    });
  }

  /* ================================================================
   * 12. NAV — hide/show on scroll direction
   * ================================================================ */
  var nav = document.querySelector('.nav');
  if (nav && !reduced) {
    var lastScroll = 0;
    ScrollTrigger.create({
      start: 'top -80',
      end: 99999,
      onUpdate: function (self) {
        var scroll = self.scroll();
        if (scroll > lastScroll && scroll > 200) {
          nav.style.transform = 'translateY(-100%)';
          nav.style.transition = 'transform 0.35s ease';
        } else {
          nav.style.transform = 'translateY(0)';
        }
        lastScroll = scroll;
      },
    });
  }

  /* ================================================================
   * 13. SCROLL PROGRESS BAR — GSAP-driven (replaces vanilla)
   * ================================================================ */
  var progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    gsap.to(progressBar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
      },
    });
    // Start at 0
    progressBar.style.transform = 'scaleX(0)';
    progressBar.style.transformOrigin = 'left';
  }

  /* ================================================================
   * 14. HERO PARALLAX LAYERS
   * ================================================================ */
  if (!reduced && !isMobile) {
    // Aurora layers move at different rates
    var aurora = document.querySelector('.aurora');
    if (aurora) {
      gsap.to(aurora, {
        y: 120,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }

    // Hero content fades and lifts
    var heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      gsap.to(heroContent, {
        y: -60,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: '30% top',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }
  }

})();
