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
   * 3. HERO SIGNATURE SEQUENCE — choreographed entrance
   * Creates a cinematic "opening scene" — not just static content.
   * ================================================================ */
  var heroContent = document.querySelector('.hero-content');
  var heroH1 = document.querySelector('.hero h1');

  function forceHeroNameVisible() {
    if (!heroH1) return;
    heroH1.style.opacity = '1';
    heroH1.style.visibility = 'visible';
    gsap.set(heroH1, { autoAlpha: 1, y: 0, visibility: 'visible', opacity: 1 });
    var nameWords = heroH1.querySelectorAll('.word-reveal');
    if (nameWords.length) gsap.set(nameWords, { autoAlpha: 1, y: 0, opacity: 1, visibility: 'visible' });
  }
  setTimeout(forceHeroNameVisible, 1500);

  if (heroH1) {
    gsap.set(heroH1, { autoAlpha: 1, y: 0, visibility: 'visible', opacity: 1 });
  }

  if (heroContent && !reduced) {
    var badge = heroContent.querySelector('.hero-badge');
    var tagline = heroContent.querySelector('.tagline');
    var cta = heroContent.querySelector('.hero-cta');
    var stats = heroContent.querySelector('.hero-stats');
    var hideable = [badge, tagline, cta, stats].filter(Boolean);
    gsap.set(hideable, { autoAlpha: 0, y: 30 });

    var tl = gsap.timeline({ delay: 0.4 });

    if (badge) {
      tl.to(badge, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0);
    }

    if (heroH1) {
      var text = heroH1.textContent.trim();
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

      gsap.set(heroH1, { autoAlpha: 1, y: 0, visibility: 'visible', opacity: 1 });
      var nameSpans = heroH1.querySelectorAll('.word-reveal');
      tl.fromTo(nameSpans, { y: 18, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: 'power3.out',
      }, 0.25);
    }

    if (tagline) {
      tl.to(tagline, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 0.6);
    }
    if (cta) {
      tl.to(cta, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.75);
    }
    if (stats) {
      tl.to(stats, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.9);
    }
  } else {
    forceHeroNameVisible();
  }

  /* ================================================================
   * 4. UPGRADED SECTION REVEALS (replaces IntersectionObserver)
   * ================================================================ */
  // Ensure all animated elements are VISIBLE by default.
  // gsap.from() would otherwise set opacity:0/y:30 immediately on creation,
  // hiding off-screen sections until their trigger fires.
  gsap.set('.section-title, .section h2, .section-intro, .project-card, .skill-category, .experience-item, .contact-card, .case-banner, .manifesto-inner, .process-step, .bento-card', { autoAlpha: 1, y: 0, x: 0, scale: 1 });

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

  // Section headings — fade up with optional line split
  gsap.utils.toArray('.section h2').forEach(function (el) {
    var lines = el.innerHTML.split('<br');
    if (lines.length > 1) {
      // Multi-line heading: wrap lines for staggered reveal
      el.innerHTML = lines.map(function (line, i) {
        return '<span class="line-reveal" style="display:block;overflow:hidden;">' + line + '</span>';
      }).join('<br');
      gsap.from('.line-reveal', {
        y: '110%', opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
      });
    } else {
      gsap.from(el, {
        y: 30, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
      });
    }
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
   * 5. PROJECT CARDS — staggered reveal + clip-path image reveals + parallax
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

    // Clip-path image reveal — sophisticated entrance for project thumbnails
    var thumbs = gsap.utils.toArray('.project-thumb img');
    thumbs.forEach(function (img) {
      // Start image hidden via clip-path
      gsap.set(img, { clipPath: 'inset(0 100% 0 0)' });

      gsap.to(img, {
        clipPath: 'inset(0 0% 0 0)',
        duration: 1.2,
        ease: 'power3.inOut',
        scrollTrigger: {
          trigger: img,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });

    // Subtle parallax on cards (desktop only)
    if (!isMobile && !reduced) {
      cards.forEach(function (card) {
        var glare = card.querySelector('.card-glare');
        var xTo = gsap.quickTo(card, 'rotationY', { ease: 'power2.out', duration: 0.4 });
        var yTo = gsap.quickTo(card, 'rotationX', { ease: 'power2.out', duration: 0.4 });
        var glareTo = gsap.quickTo(glare, 'backgroundPosition', { ease: 'power2.out', duration: 0.4 });

        card.addEventListener('mousemove', function (e) {
          var rect = card.getBoundingClientRect();
          var x = (e.clientX - rect.left) / rect.width - 0.5;
          var y = (e.clientY - rect.top) / rect.height - 0.5;
          xTo(x * 18);
          yTo(-y * 18);
          if (glare) glareTo((x + 0.5) * 100 + '% ' + (y + 0.5) * 100 + '%');
        });

        card.addEventListener('mouseleave', function () {
          xTo(0); yTo(0);
          if (glare) glareTo('50% 50%');
        });
      });
    }
  }

  /* ================================================================
   * 6. HERO STATS — spinning reel counters
   * ================================================================ */
  function spinCounter(el) {
    var target = parseFloat(el.dataset.count);
    if (isNaN(target)) return;
    var suffix = el.dataset.suffix || '';
    var decimals = parseInt(el.dataset.decimals || '0', 10);
    var obj = { val: 0 };
    var display = document.createElement('span');
    display.className = 'stat-reel';
    display.setAttribute('aria-hidden', 'true');
    el.textContent = '';
    el.appendChild(display);

    function fmt(v) {
      return v.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
    }

    // Build reel digits/string
    var current = document.createElement('span');
    current.className = 'stat-reel-current';
    current.textContent = fmt(0);
    var next = document.createElement('span');
    next.className = 'stat-reel-next';
    next.textContent = fmt(target);
    display.appendChild(current);
    display.appendChild(next);

    gsap.to(obj, {
      val: target,
      duration: 1.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 92%',
        toggleActions: 'play none none none',
      },
      onUpdate: function () {
        current.textContent = fmt(Math.round(obj.val));
      },
      onComplete: function () {
        current.textContent = fmt(target);
        display.classList.add('stat-reel-done');
      },
    });
  }

  document.querySelectorAll('.stat-value[data-count]').forEach(function (el) {
    spinCounter(el);
  });

  /* ================================================================
   * 7. HERO WATERMARK + DEPTH PARALLAX — subtle depth on mouse move
   * ================================================================ */
  var watermark = document.querySelector('.hero-watermark');
  var depthLayers = document.querySelectorAll('.hero-depth-layer');
  if ((watermark || depthLayers.length) && !isMobile && !reduced && finePointer) {
    var heroEl = document.querySelector('.hero');
    if (heroEl) {
      heroEl.addEventListener('mousemove', function (e) {
        var rect = heroEl.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;

        if (watermark) {
          gsap.to(watermark, {
            x: x * 30, y: y * 30 + -80,
            ease: 'power2.out', duration: 1.2,
          });
        }

        depthLayers.forEach(function (layer) {
          var depth = parseFloat(layer.getAttribute('data-depth') || '0.2');
          gsap.to(layer, {
            x: x * depth * 60, y: y * depth * 60,
            ease: 'power2.out', duration: 1.4,
          });
        });
      });

      heroEl.addEventListener('mouseleave', function () {
        if (watermark) gsap.to(watermark, { x: 0, y: -80, ease: 'power2.out', duration: 1.2 });
        depthLayers.forEach(function (layer) {
          gsap.to(layer, { x: 0, y: 0, ease: 'power2.out', duration: 1.4 });
        });
      });
    }
  }

  /* ================================================================
   * 7.5 SECTION DIVIDERS — animated gold line reveals
   * ================================================================ */
  var sections = gsap.utils.toArray('.section + .section');
  sections.forEach(function (sec) {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 88%',
      onEnter: function () { sec.classList.add('in-view'); },
      onLeaveBack: function () { sec.classList.remove('in-view'); },
    });
  });

  /* ================================================================
   * 8. SKILL CATEGORIES + PROCESS + TESTIMONIAL — staggered reveal
   * ================================================================ */
  gsap.utils.toArray('.skill-category, .process-step, .testimonial-inner').forEach(function (el) {
    gsap.from(el, {
      y: 30, opacity: 0, duration: 0.7, stagger: 0.08, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
    });
  });

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
   * 9. CONTACT CARDS — scale up stagger + gold border
   * ================================================================ */
  var contacts = gsap.utils.toArray('.contact-card');
  if (contacts.length) {
    gsap.from(contacts, {
      scale: 0.92,
      opacity: 0,
      duration: 0.5,
      stagger: 0.08,
      ease: 'back.out(1.4)',
      scrollTrigger: {
        trigger: '.contact-grid',
        start: 'top 88%',
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
   * 7. HERO WATERMARK + PARALLAX DEPTH — subtle motion on logo + 3 planes
   * ================================================================ */
  if (!isMobile && !reduced) {
    // Watermark parallax
    var watermark = document.querySelector('.hero-watermark');
    if (watermark) {
      gsap.to(watermark, {
        y: -80, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 2 }
      });
    }

    // Parallax depth layers — different speeds create cinematic depth
    var layers = document.querySelectorAll('.parallax-layer');
    layers.forEach(function (layer) {
      var speed = parseFloat(layer.getAttribute('data-speed')) || 0.3;
      gsap.to(layer, {
        y: -80 * speed * 3, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.5 }
      });
    });
  }

  /* ================================================================
   * 12. BACK TO TOP — show/hide based on scroll
   * ================================================================ */
  var backBtn = document.getElementById('backToTop');
  if (backBtn && !reduced) {
    ScrollTrigger.create({
      start: 'top -60%',
      end: 99999,
      onUpdate: function (self) {
        if (self.progress > 0) {
          backBtn.classList.add('visible');
        } else {
          backBtn.classList.remove('visible');
        }
      },
    });
    backBtn.addEventListener('click', function () {
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  /* ================================================================
   * 16. NAV — hide/show on scroll direction
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
   * 14. TICKER — speed variation on scroll
   * ================================================================ */
  var ticker = document.querySelector('.ticker-track');
  if (ticker && !reduced) {
    gsap.to(ticker, {
      x: '-=60', ease: 'none',
      scrollTrigger: { trigger: '.ticker', start: 'top bottom', end: 'bottom top', scrub: 2 }
    });
  }

  /* ================================================================
   * 15. HERO PARALLAX LAYERS
   * ================================================================ */
  if (!reduced && !isMobile) {
    // Aurora layers move at different rates
    var aurora = document.querySelector('.aurora');
    if (aurora) {
      gsap.to(aurora, {
        y: 120, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
      });
    }

    // Hero content fades and lifts
    var heroContentFade = document.querySelector('.hero-content');
    if (heroContentFade) {
      gsap.to(heroContentFade, {
        y: -60, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: '30% top', end: 'bottom top', scrub: 1 }
      });
    }
  }

  /* ================================================================
   * FAIL-OPEN: deep links (#work, #contact) must not land on a blank viewport.
   * Reveal any entrance tween whose trigger is already on screen.
   * ================================================================ */
  function revealViewportNow() {
    if (!window.ScrollTrigger) return;
    window.ScrollTrigger.refresh();
    window.ScrollTrigger.getAll().forEach(function (st) {
      if (!st.animation) return;
      if (st.vars && st.vars.scrub) return;
      var el = st.trigger;
      if (!el || !el.getBoundingClientRect) return;
      var r = el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) {
        st.animation.progress(1);
      }
    });
    document.querySelectorAll('.project-thumb img').forEach(function (img) {
      var r = img.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) {
        gsap.set(img, { clipPath: 'inset(0 0% 0 0)' });
      }
    });
  }

  function scheduleViewportReveal() {
    requestAnimationFrame(function () {
      revealViewportNow();
      requestAnimationFrame(revealViewportNow);
    });
  }

  scheduleViewportReveal();
  window.addEventListener('load', scheduleViewportReveal);
  window.addEventListener('hashchange', scheduleViewportReveal);
  if (location.hash) {
    var hashTarget = document.querySelector(location.hash);
    if (hashTarget && window.__lenis) {
      window.__lenis.scrollTo(hashTarget, { immediate: true, offset: -80 });
    }
    scheduleViewportReveal();
  }

})();
