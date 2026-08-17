/**
 * hero-scene.js — WebGL hero background for fahadibrahim93.github.io
 * Three.js particle nebula + wireframe geometry, mouse-reactive.
 * Guardrails: DPR cap, pause when offscreen/hidden, reduced-motion skip,
 * mobile skip (CSS aurora carries the look), try/catch WebGL fallback.
 *
 * PERF: Three.js (~735KB) is dynamically imported ONLY after shouldRun()
 * passes, so mobile / reduced-motion users never download it.
 */

const canvas = document.getElementById('hero-canvas');
const hero = document.querySelector('.hero');

function shouldRun() {
  if (!canvas || !hero) return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  // Desktop-class viewports only — phones get the CSS aurora layer
  if (window.innerWidth < 900) return false;
  return true;
}

if (shouldRun()) {
  // Lazy-load the heavy Three.js bundle only when we'll actually use it
  import('./vendor/three.module.min.js')
    .then((THREE) => {
      try {
        initScene(THREE);
      } catch (err) {
        // WebGL unavailable — canvas stays transparent, CSS aurora remains.
        console.info('[hero-scene] WebGL init skipped:', err.message);
      }
    })
    .catch((err) => {
      console.info('[hero-scene] Three.js load skipped:', err.message);
    });
}

function initScene(THREE) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'low-power'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0a0f, 0.016);

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
  camera.position.set(0, 0, 30);

  // ---------- Particle nebula ----------
  const COUNT = 1400;
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const cyan = new THREE.Color(0x00f0ff);
  const purple = new THREE.Color(0xa855f7);
  const green = new THREE.Color(0x00ff88);

  for (let i = 0; i < COUNT; i++) {
    // Flattened ellipsoid cloud for a wide cinematic field
    const r = 18 + Math.random() * 26;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta) * 1.4;
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
    positions[i * 3 + 2] = r * Math.cos(phi) * 0.8 - 6;

    const roll = Math.random();
    const c = roll < 0.62 ? cyan : roll < 0.9 ? purple : green;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const pMat = new THREE.PointsMaterial({
    size: 0.14,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // ---------- Wireframe centerpiece ----------
  const icoOuter = new THREE.Mesh(
    new THREE.IcosahedronGeometry(9, 1),
    new THREE.MeshBasicMaterial({
      color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.16
    })
  );
  const icoInner = new THREE.Mesh(
    new THREE.IcosahedronGeometry(13.5, 0),
    new THREE.MeshBasicMaterial({
      color: 0xa855f7, wireframe: true, transparent: true, opacity: 0.09
    })
  );
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(16, 0.03, 8, 120),
    new THREE.MeshBasicMaterial({
      color: 0x00ff88, transparent: true, opacity: 0.22
    })
  );
  ring.rotation.x = Math.PI / 2.4;
  scene.add(icoOuter, icoInner, ring);

  // ---------- Interaction state ----------
  const mouse = { x: 0, y: 0 };
  const eased = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  // ---------- Resize ----------
  function resize() {
    const w = hero.clientWidth;
    const h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // ---------- Pause when offscreen or tab hidden ----------
  let inView = true;
  new IntersectionObserver((entries) => {
    inView = entries[0].isIntersecting;
  }, { threshold: 0 }).observe(hero);

  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
  });

  // ---------- Scroll fade + parallax ----------
  let scrollFade = 1;
  function onScroll() {
    const y = window.scrollY;
    const h = hero.clientHeight || 1;
    scrollFade = Math.max(0, 1 - y / (h * 0.85));
    canvas.style.opacity = scrollFade.toFixed(3);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Render loop ----------
  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    if (!running || !inView || scrollFade <= 0.01) return;
    const t = clock.getElapsedTime();

    eased.x += (mouse.x - eased.x) * 0.04;
    eased.y += (mouse.y - eased.y) * 0.04;

    particles.rotation.y = t * 0.02 + eased.x * 0.12;
    particles.rotation.x = eased.y * 0.08;

    icoOuter.rotation.y = t * 0.08;
    icoOuter.rotation.x = t * 0.04;
    icoInner.rotation.y = -t * 0.05;
    icoInner.rotation.z = t * 0.03;
    ring.rotation.z = t * 0.06;

    camera.position.x = eased.x * 2.2;
    camera.position.y = -eased.y * 1.6 - window.scrollY * 0.004;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  });

  // Signal success for tests/debugging
  canvas.dataset.webgl = 'active';
}
