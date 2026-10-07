// ==========================================================================
// Archdes Digital — Main Intro Controller
// Integrated directly from archdes-intro/index (1).html
// ==========================================================================

(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let done = false;
  let tl = null;
  let animId = null;
  let safetyTimer = null;

  document.body.classList.add('locked');

  function getFlag(k) {
    try { return typeof window !== 'undefined' && window.sessionStorage ? sessionStorage.getItem(k) : null; } catch (e) { return null; }
  }
  function setFlag(k, v) {
    try { if (typeof window !== 'undefined' && window.sessionStorage) sessionStorage.setItem(k, v); } catch (e) {}
  }

  const loaderEl = document.getElementById('netLoader');
  const hasSeenPreloader = getFlag('archdes_preloader_seen');

  function triggerRocketLaunchTransition(onComplete) {
    const rocket = document.getElementById('loaderRocketGroup');
    const canvas = document.getElementById('loaderThrustCanvas');
    const caption = document.getElementById('loaderCaption');
    const beam = document.getElementById('loaderThrustBeam');

    if (!rocket || !loaderEl) {
      if (loaderEl) loaderEl.style.display = 'none';
      onComplete();
      return;
    }

    if (caption) {
      caption.style.transition = 'opacity 0.25s ease';
      caption.style.opacity = '0';
    }

    // Set up high-performance sparkles canvas
    let ctx = null;
    const W = window.innerWidth, H = window.innerHeight;
    if (canvas) {
      canvas.width = W;
      canvas.height = H;
      ctx = canvas.getContext('2d');
    }

    const sparks = [];
    // Cosmic starlight palette matching theme: Cyber Blue, Sky Cyan, Electric White, Astral Pink
    const sparkColors = ['#ffffff', '#8fa8ff', '#1f3dff', '#00d2ff', '#FF2E93', '#c084fc'];
    let isEmitting = true;
    let animId = null;

    function spawnSparks(x, y, count) {
      for (let i = 0; i < count; i++) {
        const spread = (Math.random() - 0.5) * 1.3;
        const speed = 7 + Math.random() * 22;
        sparks.push({
          x: x + (Math.random() - 0.5) * 24,
          y: y + Math.random() * 8,
          vx: spread * speed * 0.45,
          vy: Math.abs(speed) + 5,
          size: 1.5 + Math.random() * 3.5,
          color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
          alpha: 1,
          decay: 0.02 + Math.random() * 0.045
        });
      }
    }

    // Phase 1: Engine ignition rumble (0 - 180ms)
    const rumbleStart = Date.now();
    function rumble() {
      if (Date.now() - rumbleStart < 180) {
        const rx = (Math.random() - 0.5) * 4;
        const ry = (Math.random() - 0.5) * 4;
        rocket.style.transform = `translate(${rx}px, ${ry}px)`;
        if (beam) {
          beam.style.height = `${25 + Math.random() * 25}px`;
          beam.style.opacity = '0.85';
        }
        requestAnimationFrame(rumble);
      } else {
        takeoff();
      }
    }

    // Phase 2: Hypersonic rocket ascent & thrust burst
    function takeoff() {
      if (beam) {
        beam.style.height = '150px';
        beam.style.opacity = '1';
      }

      // Accelerate rapidly upward
      rocket.style.transition = 'transform 0.82s cubic-bezier(0.55, 0, 0.85, 0.2)';
      rocket.style.transform = `translateY(-${H + 300}px) scale(1.15)`;

      // Backdrop smoothly fades out mid-launch directly into the intro
      setTimeout(() => {
        loaderEl.style.transition = 'opacity 0.45s ease';
        loaderEl.style.opacity = '0';
      }, 420);

      // Conclude rocket transition and reveal intro
      setTimeout(() => {
        isEmitting = false;
        setTimeout(() => {
          if (animId) cancelAnimationFrame(animId);
          loaderEl.style.display = 'none';
          onComplete();
        }, 220);
      }, 780);
    }

    // Sparkle render loop
    function loop() {
      if (ctx) {
        ctx.clearRect(0, 0, W, H);
        const rect = rocket.getBoundingClientRect();
        const nozzleX = rect.left + rect.width / 2;
        const nozzleY = rect.bottom - 8;

        if (isEmitting && nozzleY > -60) {
          spawnSparks(nozzleX, nozzleY, 8);
        }

        ctx.save();
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i];
          s.x += s.vx;
          s.y += s.vy;
          s.vy += 0.38; // starlight gravity
          s.alpha -= s.decay;

          if (s.alpha <= 0) {
            sparks.splice(i, 1);
            continue;
          }

          ctx.globalAlpha = Math.max(0, s.alpha);
          ctx.fillStyle = s.color;
          ctx.shadowColor = s.color;
          ctx.shadowBlur = 9;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      animId = requestAnimationFrame(loop);
    }

    rumble();
    loop();
  }

  function completeLoadingAndPlay(onReady) {
    if (!hasSeenPreloader && loaderEl && loaderEl.style.display !== 'none') {
      setFlag('archdes_preloader_seen', '1');
      const start = window.__archdesPreloaderStart || Date.now();
      const elapsed = Date.now() - start;
      const targetDuration = 3000; // exactly 3 seconds for first-time display
      const waitTime = Math.max(0, targetDuration - elapsed);

      setTimeout(() => {
        triggerRocketLaunchTransition(onReady);
      }, waitTime);
    } else {
      if (loaderEl) loaderEl.style.display = 'none';
      setFlag('archdes_preloader_seen', '1');
      onReady();
    }
  }

  function finish() {
    if (done) return;
    done = true;

    if (loaderEl) {
      loaderEl.classList.add('hidden');
      loaderEl.style.display = 'none';
    }

    if (safetyTimer) clearTimeout(safetyTimer);

    if (tl) {
      try {
        tl.pause();
      } catch (e) {}
    }

    if (animId) {
      try {
        cancelAnimationFrame(animId);
      } catch (e) {}
    }

    document.body.classList.remove('locked');

    // 1. Transition intro out
    const introEl = document.getElementById('intro');
    if (introEl) {
      introEl.classList.add('out');
      setTimeout(() => {
        if (done && introEl.classList.contains('out')) {
          introEl.style.display = 'none';
        }
      }, 850);
    }

    // 2. Unhide main site container
    const siteEl = document.getElementById('site');
    if (siteEl) {
      siteEl.hidden = false;
      siteEl.removeAttribute('hidden');
      siteEl.style.display = 'block';
    }

    // 3. Trigger site activation & animations
    if (typeof window.enterSite === 'function') {
      try {
        window.enterSite();
      } catch (err) {
        console.error('enterSite error:', err);
      }
    }

    // 4. Ensure hero section is visible immediately
    const heroEl = document.getElementById('hero');
    if (heroEl) {
      heroEl.classList.add('in');
    }
  }

  // If reduced motion, finish immediately
  if (reduce) {
    finish();
    return;
  }

  // Bind Skip button
  const skipBtn = document.getElementById('skip');
  if (skipBtn) {
    skipBtn.addEventListener('click', finish);
  }

  let gsapWaitAttempts = 0;
  function initIntro() {
    if (typeof gsap === 'undefined') {
      gsapWaitAttempts++;
      if (gsapWaitAttempts > 30) { // 1.5 seconds max wait
        console.warn('GSAP could not be loaded within 1.5s. Revealing main site gracefully.');
        finish();
        return;
      }
      setTimeout(initIntro, 50);
      return;
    }

    try {
      runIntro();
    } catch (introErr) {
      console.warn('Intro animation encountered an error, falling back to main site:', introErr);
      finish();
    }
  }

  function runIntro() {
    const $ = id => document.getElementById(id);
    const bg = $('bg'), cam = $('cam'), cv = $('liq');
    if (!cv) { finish(); return; }
    const ctx = cv.getContext('2d');
    if (!ctx) { finish(); return; }
    const PINK = '#FF2E93', WHITE = '#FFFFFF', BLUE = '#1f3dff', DEEP = '#000000', DARK_NAVY = '#030720';

    /* ---------- liquid flood (metaballs on canvas + SVG goo filter) ---------- */
    let W, H;
    function size() {
      W = cv.width = Math.floor(window.innerWidth / 2);
      H = cv.height = Math.floor(window.innerHeight / 2);
    }
    window.addEventListener('resize', size);
    size();

    const fl = { p: 0, color: PINK, ox: 0.5, oy: 0.5 };
    const seeds = Array.from({ length: 16 }, (_, i) => ({
      a: (i / 16) * 6.283 + Math.random() * 0.4,
      d: 0.35 + Math.random() * 0.65,
      r: 0.45 + Math.random() * 0.55,
      f: 2 + Math.random() * 3
    }));

    function draw(t) {
      animId = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, W, H);
      if (fl.p <= 0) return;
      const R = Math.hypot(W, H),
        x0 = fl.ox * W,
        y0 = fl.oy * H,
        p = fl.p;
      ctx.fillStyle = fl.color;
      if (p >= 0.999) {
        ctx.fillRect(0, 0, W, H);
        return;
      }
      seeds.forEach(s => {
        const wob = Math.sin((t / 1000) * s.f + s.a) * 14 * p;
        ctx.beginPath();
        ctx.arc(
          x0 + Math.cos(s.a) * R * p * s.d * 0.55,
          y0 + Math.sin(s.a) * R * p * s.d * 0.55,
          R * p * s.r * 0.62 + wob,
          0,
          6.283
        );
        ctx.fill();
      });
    }
    draw(0);

    function flood(targetTl, t, color, ox, oy, dur = 0.6) {
      targetTl
        .set(fl, { color, ox, oy, p: 0 }, t)
        .to(fl, { p: 1, duration: dur, ease: 'power2.inOut' }, t)
        .set(bg, { backgroundColor: color }, t + dur)
        .set(fl, { p: 0 }, t + dur + 0.02);
    }

    const shake = a =>
      gsap
        .timeline()
        .to(cam, { scale: 1 + a / 1500, duration: 0.22, ease: 'sine.out' })
        .to(cam, { scale: 1, duration: 0.7, ease: 'sine.inOut' });

    /* letters for the logo wordmark */
    const wordEl = $('word');
    if (wordEl && !wordEl.children.length) {
      'ARCHDES'.split('').forEach(c => {
        const s = document.createElement('span');
        s.textContent = c;
        wordEl.appendChild(s);
      });
    }
    const letters = wordEl ? wordEl.children : [];

    /* ---------- master timeline ---------- */
    tl = gsap.timeline({
      paused: true,
      onUpdate() {
        const bar = $('bar');
        if (bar && tl) bar.style.transform = `scaleX(${tl.progress()})`;
      },
      onComplete() {
        finish();
      }
    });

    // liquid floods (1st Pink, 2nd White, 3rd Blue) - Circles behind words removed
    flood(tl, 0.1, PINK, 0.1, 0.9, 0.9);   // 1st Background: Pink
    flood(tl, 1.65, WHITE, 0.95, 0.2, 0.85); // 2nd Background: White
    flood(tl, 3.05, BLUE, 0.5, 0, 0.85);   // 3rd Background: Blue
    tl.to(bg, { backgroundColor: DEEP, duration: 0.9, ease: 'sine.inOut' }, 3.8); // Transition to deep dark for 3D desktop
    tl.to('#tech', { opacity: 1, duration: 0.9, ease: 'sine.inOut' }, 3.5);

    // WEB. (White on Pink) / DESIGN. (Dark on White) / REIMAGINED. (White on Blue)
    function reveal(id, color, tIn, tOut) {
      tl.set(id, { opacity: 1, color: color, yPercent: 45, scale: 1.14, clipPath: 'inset(0 0 100% 0)' }, tIn)
        .to(id, { yPercent: 0, scale: 1, clipPath: 'inset(0 0 0% 0)', duration: 0.95, ease: 'expo.out' }, tIn)
        .to(id, { yPercent: -45, scale: 0.97, clipPath: 'inset(100% 0 0 0)', duration: 0.65, ease: 'power3.inOut' }, tOut);
    }
    reveal('#w1', '#FFFFFF', 0.75, 1.75);     // Stage 1: White text on Pink
    reveal('#w2', DARK_NAVY, 2.25, 3.2);      // Stage 2: Deep Dark text on White
    tl.add(shake(10), 0.75).add(shake(10), 2.25);

    tl.set('.brush', { opacity: 1 }, 3.6)
      .to('.brush path', { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' }, 3.6)
      .set('#w3', { opacity: 1, color: '#FFFFFF', yPercent: 45, scale: 1.14, clipPath: 'inset(0 0 100% 0)' }, 3.75)
      .to('#w3', { yPercent: 0, scale: 1, clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'expo.out' }, 3.75) // Stage 3: White text on Blue
      .add(shake(14), 3.75)
      .to('#w3', { scale: 5, opacity: 0, duration: 0.75, ease: 'power3.in' }, 5.15)
      .to('.brush', { opacity: 0, scaleY: 2.5, duration: 0.6, ease: 'power2.in' }, 5.15);

    // desktop + logo sequence lives in its own timeline, offset so the longer title beats fit
    const t2 = gsap.timeline();
    // desktop punches in
    t2.set('.scene', { visibility: 'visible' }, 3.9)
      .fromTo('#rig', { y: () => window.innerHeight * 0.7, rotationY: -75, rotationX: 28, scale: 0.55, opacity: 0 },
        { y: 0, rotationY: -26, rotationX: 10, scale: 1, opacity: 1, duration: 0.95, ease: 'expo.out' }, 3.9)
      .add(shake(12), 4.15)
      .to('#rig', { rotationY: 16, rotationX: 4, duration: 2.2, ease: 'sine.inOut' }, 4.85)
      .fromTo('.chip', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)', stagger: 0.12 }, 4.3)
      .to('.chip', { y: '-=14', duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: 3, stagger: 0.15 }, 4.8)
      .set('#o1,#o2', { xPercent: -50, yPercent: -50, rotationX: 72 }, 3.9)
      .fromTo('#o1', { rotation: 0, opacity: 0 }, { rotation: 360, opacity: 1, duration: 3.2, ease: 'none' }, 4.2)
      .fromTo('#o2', { rotation: 90, opacity: 0, scale: 0.75 }, { rotation: -270, opacity: 1, duration: 3.2, ease: 'none' }, 4.3)
      // website on the screen comes alive
      .to('#url', { width: '40%', padding: '.2em 1em', duration: 0.8, ease: 'steps(15)' }, 4.5)
      .to('#scroll', { y: () => { const sc = $('scroll'); return sc ? -sc.scrollHeight * 0.42 : -100; }, duration: 1.4, ease: 'power2.inOut' }, 4.9)
      .to('#glare', { backgroundPosition: '-60% 0', duration: 1.4, ease: 'power1.inOut' }, 4.6)
      .to('#scroll', { y: 0, duration: 0.6, ease: 'power2.inOut' }, 6.4)
      // cursor glides to the button and clicks
      .fromTo('#cur', {
        x: () => { const sc = $('screen'); return sc ? sc.offsetWidth * 0.25 : 50; },
        y: () => { const sc = $('screen'); return sc ? sc.offsetHeight * 0.85 : 150; },
        opacity: 0
      }, {
        x: () => {
          const cta = $('cta');
          return cta && cta.offsetParent ? cta.offsetParent.offsetLeft + cta.offsetLeft + cta.offsetWidth * 0.5 : 100;
        },
        y: () => {
          const cta = $('cta');
          return cta && cta.offsetParent ? cta.offsetParent.offsetTop + cta.offsetTop + cta.offsetHeight * 0.5 : 40;
        },
        opacity: 1, duration: 1.2, ease: 'power3.inOut'
      }, 5.5)
      .to('#cta', { scale: 0.88, duration: 0.08, yoyo: true, repeat: 1, background: '#d7ff00', color: '#000000' }, 6.75)
      .to('#cur', { scale: 0.8, duration: 0.08, yoyo: true, repeat: 1 }, 6.75);

    // camera dives into the screen -> flash cut
    t2.to('#rig', { rotationY: 0, rotationX: 0, scale: 9, duration: 1.0, ease: 'power3.in' }, 7.0)
      .to(cam, { filter: 'blur(3px) saturate(1.6)', duration: 1, ease: 'power2.in' }, 7.0)
      .fromTo('#flash', { opacity: 0 }, { opacity: 1, duration: 0.22, ease: 'sine.in' }, 7.8)
      .set('.scene', { visibility: 'hidden' }, 8.03)
      .set(cam, { filter: 'none' }, 8.03)
      .set('#tech', { opacity: 1 }, 8.03)
      .set('#logo', { visibility: 'visible' }, 8.03)
      .to('#flash', { opacity: 0, duration: 0.8, ease: 'sine.out' }, 8.06);

    // logo reveal: mark rises in, ring blooms, wordmark lifts letter by letter, DIGITAL tracks in
    t2.fromTo('#logoimg', { clipPath: 'inset(100% -40% 0 -40%)' }, { clipPath: 'inset(-40% -40% -40% -40%)', duration: 1.4, ease: 'expo.inOut' }, 8.1)
      .fromTo('#mark', { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.4, ease: 'expo.inOut' }, 8.1)
      .fromTo('#shock', { scale: 0.2, opacity: 0.8, immediateRender: false }, { scale: 6, opacity: 0, duration: 1.8, ease: 'power2.out', immediateRender: false }, 8.9)
      .fromTo(letters, { yPercent: 115, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, ease: 'power4.out', stagger: 0.06 }, 8.85)
      .add(shake(8), 9.0)
      .fromTo('#sub', { opacity: 0, yPercent: 40, letterSpacing: '0.2em' }, { opacity: 1, yPercent: 0, letterSpacing: '0.075em', duration: 1.2, ease: 'expo.out' }, 9.3)
      .to('#mark', { filter: 'drop-shadow(0 0 .7em rgba(215,255,0,.9)) drop-shadow(0 0 1.2em rgba(168,85,247,.7))', duration: 1, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 9.6)
      .to({}, { duration: 1.0 }, 11.2);
    tl.add(t2, 1.5);

    window.introTl = tl;
    window.tl = tl;

    function fit() {
      document.querySelectorAll('.w').forEach(w => {
        const sp = w.firstElementChild;
        if (!sp) return;
        w.style.fontSize = '100px';
        const k = Math.min((window.innerWidth * 0.88) / sp.getBoundingClientRect().width, (window.innerHeight * 0.46) / 100);
        w.style.fontSize = 100 * k + 'px';
      });
    }
    window.addEventListener('resize', fit);

    const navmark = $('navmark');
    const logoimg = $('logoimg');
    if (navmark && logoimg) {
      navmark.src = logoimg.src;
    }

    function launch() {
      fit();
      completeLoadingAndPlay(() => {
        setTimeout(() => {
          if (!tl) return;
          tl.play(0);
          if (safetyTimer) clearTimeout(safetyTimer);
          safetyTimer = setTimeout(() => {
            if (!done) finish();
          }, 35000);
        }, 100);
      });
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(launch);
    } else {
      launch();
    }

    // Global restart function for navbar logo clicks
    window.restartIntro = function () {
      if (safetyTimer) clearTimeout(safetyTimer);
      done = false;
      document.body.classList.add('locked');
      const introEl = document.getElementById('intro');
      if (introEl) {
        introEl.style.display = '';
        introEl.classList.remove('out');
      }
      const site = document.getElementById('site');
      if (site) {
        site.hidden = true;
      }
      window.scrollTo(0, 0);

      // Reset animated state
      gsap.set('.scene', { visibility: 'hidden' });
      gsap.set('#logo', { visibility: 'hidden' });
      gsap.set('#logoimg', { clipPath: 'inset(100% -40% 0 -40%)' });
      gsap.set('#mark', { scale: 0.85, opacity: 0, filter: 'drop-shadow(0 0 16px rgba(0, 210, 255, 0.75)) drop-shadow(0 0 30px rgba(139, 92, 246, 0.5))' });
      gsap.set(letters, { yPercent: 115, opacity: 0 });
      gsap.set('#sub', { opacity: 0, yPercent: 40, letterSpacing: '0.2em' });
      gsap.set('.ring', { opacity: 0 });
      gsap.set('.brush', { opacity: 0 });
      gsap.set('.brush path', { strokeDashoffset: 1 });
      gsap.set('#w1', { opacity: 0, color: '#FFFFFF', scale: 1, yPercent: 45, clipPath: 'inset(0 0 100% 0)' });
      gsap.set('#w2', { opacity: 0, color: DARK_NAVY, scale: 1, yPercent: 45, clipPath: 'inset(0 0 100% 0)' });
      gsap.set('#w3', { opacity: 0, color: '#FFFFFF', scale: 1, yPercent: 45, clipPath: 'inset(0 0 100% 0)' });
      gsap.set('#url', { width: 0, padding: '0.2em 0' });
      gsap.set('#cam', { scale: 1, filter: 'none' });
      gsap.set('#tech', { opacity: 0 });
      gsap.set(bg, { backgroundColor: PINK });

      fl.p = 0;
      fl.color = PINK;

      fit();
      safetyTimer = setTimeout(finish, 14500);
      tl.seek(0).play();
    };

    window.replayIntro = window.restartIntro;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIntro);
  } else {
    initIntro();
  }
})();
