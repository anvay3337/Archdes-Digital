// OpenAI Astra-Style Crisp Star Spiral Galaxy (Crystal-clear deep space, pinpoint illuminated stars 5% bigger, zero blur)
(function () {
  const canvas = document.getElementById('vortex');
  if (!canvas) return;

  if (typeof THREE === 'undefined') {
    console.warn('Three.js is unavailable. Vortex animation gracefully skipped.');
    window.vortex = { resize() {}, start() {} };
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  } catch (webglErr) {
    console.warn('WebGL not supported or disabled in this browser:', webglErr.message);
    window.vortex = { resize() {}, start() {} };
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 120);
  camera.position.set(0, 6.5, 11);

  // Custom GPU Shader for crisp, pinpoint, shimmering stars (stars 5% bigger)
  const starVertexShader = `
    attribute float aSize;
    attribute float aPhase;
    attribute float aSpeed;
    attribute vec3 aColor;

    uniform float uTime;
    uniform float uPixelRatio;

    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      vColor = aColor;

      // Organic twinkling: gentle harmonic breathing per star
      float twinkle = 0.55 + 0.45 * sin(uTime * aSpeed + aPhase);
      vAlpha = twinkle;

      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      
      // Crisp star size with distance attenuation (stars 5% bigger: aSize * 1.05)
      gl_PointSize = (aSize * 1.05) * uPixelRatio * (280.0 / -mvPosition.z) * (0.85 + 0.25 * sin(uTime * 1.5 + aPhase));
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const starFragmentShader = `
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      // Distance from center of point sprite
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      if (dist > 0.5) discard;

      // Crisp starlight profile: brilliant central core with razor-clean antialiased edge
      // Absolutely NO blurry dust/fog - pure crystal-clear space
      float intensity = clamp(1.0 - dist * 2.0, 0.0, 1.0);
      intensity = pow(intensity, 1.35);

      gl_FragColor = vec4(vColor, intensity * vAlpha * 0.95);
    }
  `;

  // Color Palette: High-concept starlight spectrum with alche.studio Electric Lime
  const colorPalette = [
    new THREE.Color(0xffffff), // Pure diamond white
    new THREE.Color(0xd7ff00), // Electric Lime (alche.studio signature)
    new THREE.Color(0xfffaed), // Soft warm champagne
    new THREE.Color(0xfbbf24), // Solar amber
    new THREE.Color(0xc084fc), // Amethyst violet
    new THREE.Color(0xa855f7), // Deep purple
    new THREE.Color(0xf43f5e), // Coral rose
    new THREE.Color(0x38bdf8), // Starlight cyan
    new THREE.Color(0xe0e7ff)  // Stellar ice
  ];

  // 1. Spiral Stars (~2400 airy stars forming 4 distinct spiral arms)
  const N_SPIRAL = 2400;
  const N_OUTER = 800;
  const N_TOTAL = N_SPIRAL + N_OUTER;

  const positions = new Float32Array(N_TOTAL * 3);
  const colors = new Float32Array(N_TOTAL * 3);
  const sizes = new Float32Array(N_TOTAL);
  const phases = new Float32Array(N_TOTAL);
  const speeds = new Float32Array(N_TOTAL);

  for (let i = 0; i < N_TOTAL; i++) {
    if (i < N_SPIRAL) {
      // 4 graceful spiral arms
      const r = Math.pow(Math.random(), 1.7) * 11.5 + 0.3;
      const arms = 4;
      const armAngle = (i % arms) * ((Math.PI * 2) / arms);
      const spiralAngle = armAngle + r * 0.65;

      // Airy, delicate scatter (not dense, clearly outlines the spiral)
      const spread = (Math.random() - 0.5) * (0.24 + r * 0.14);
      const ySpread = (Math.random() - 0.5) * (0.32 + r * 0.08);

      positions[i * 3] = Math.cos(spiralAngle) * r + spread;
      positions[i * 3 + 1] = ySpread;
      positions[i * 3 + 2] = Math.sin(spiralAngle) * r + spread;

      // Color selection
      const normR = r / 11.5;
      let c;
      if (normR < 0.18) {
        c = Math.random() < 0.6 ? colorPalette[0] : colorPalette[1]; // core white/champagne
      } else if (normR < 0.55) {
        const pool = [colorPalette[0], colorPalette[2], colorPalette[4], colorPalette[6], colorPalette[7]];
        c = pool[Math.floor(Math.random() * pool.length)];
      } else {
        const pool = [colorPalette[0], colorPalette[3], colorPalette[5], colorPalette[7], colorPalette[8]];
        c = pool[Math.floor(Math.random() * pool.length)];
      }
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      // Sizes: mostly fine micro-stars, some radiant beacons
      const isBeacon = Math.random() < 0.12;
      sizes[i] = isBeacon ? (0.28 + Math.random() * 0.15) : (0.13 + Math.random() * 0.08);
    } else {
      // Outer deep field distant stars
      const sr = 14.0 + Math.random() * 24.0;
      const st = Math.random() * Math.PI * 2;
      const sp = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = sr * Math.sin(sp) * Math.cos(st);
      positions[i * 3 + 1] = sr * Math.sin(sp) * Math.sin(st);
      positions[i * 3 + 2] = sr * Math.cos(sp);

      const pool = [colorPalette[0], colorPalette[1], colorPalette[3], colorPalette[5]];
      const c = pool[Math.floor(Math.random() * pool.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      sizes[i] = 0.10 + Math.random() * 0.06;
    }

    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] = 1.2 + Math.random() * 2.2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader: starVertexShader,
    fragmentShader: starFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) }
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const starField = new THREE.Points(geometry, material);
  scene.add(starField);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let spin = 0;
  let lastScroll = window.scrollY;
  let mouseX = 0, mouseY = 0;
  let targetRotX = 0, targetRotY = 0;

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, 2);
  }
  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('pointermove', e => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    targetRotY = mouseX * 0.22;
    targetRotX = mouseY * 0.14;
  });

  const clock = new THREE.Clock();

  function loop() {
    requestAnimationFrame(loop);
    const t = clock.getElapsedTime();
    material.uniforms.uTime.value = t;

    const site = document.getElementById('site');
    const isSiteActive = site && !site.hidden;

    if (isSiteActive) {
      const currentScroll = window.scrollY;
      const delta = currentScroll - lastScroll;
      lastScroll = currentScroll;
      spin += delta * 0.00025;
      spin *= 0.94;
    } else {
      lastScroll = window.scrollY;
      spin *= 0.94;
    }

    const rotSpeed = reduceMotion ? 0 : (isSiteActive ? 0.0010 + spin : 0.00065);
    starField.rotation.y += rotSpeed;

    // Gentle mouse tilt
    starField.rotation.x += (targetRotX * 0.25 - starField.rotation.x) * 0.04;
    starField.rotation.z += (-targetRotY * 0.18 - starField.rotation.z) * 0.04;

    // Scroll flies down into the cosmic galaxy
    const currentScroll = window.scrollY;
    const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const scrollProgress = isSiteActive ? Math.min(1, Math.max(0, currentScroll / maxScroll)) : 0;
    const targetCamY = 6.5 - scrollProgress * 3.2;
    const targetCamZ = 11.0 - scrollProgress * 3.5;

    camera.position.y += (targetCamY - camera.position.y) * 0.08;
    camera.position.z += (targetCamZ - camera.position.z) * 0.08;
    camera.position.x += (targetRotY * 1.4 - camera.position.x) * 0.05;

    camera.lookAt(0, 0, 0);
    try {
      renderer.render(scene, camera);
    } catch (e) {
      // Absorb transient WebGL context frame interruptions
    }
  }

  let isContextLost = false;
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    isContextLost = true;
    cancelAnimationFrame(animId);
  }, false);

  canvas.addEventListener('webglcontextrestored', () => {
    isContextLost = false;
    loop();
  }, false);

  loop();

  window.vortex = {
    resize,
    start() {
      resize();
    }
  };
})();
