/**
 * CoverflowCarousel — 3D interactive Coverflow component.
 * Exact implementation of the component provided by user.
 */
(function () {
  const SLIDES = [
    {
      src: "assets/portfolio/house-of-archdes.jpg",
      alt: "HouseOfArchdes architecture and interior design",
      title: "HouseOfArchdes",
      subtitle: "Architecture & Interior Design",
      year: "2025",
      meta: [
        { label: "Discipline", value: "Architecture & Interior Design" },
        { label: "Year", value: "2025" },
        { label: "Scope", value: "Spatial Concept & Turnkey Interiors" },
      ],
    },
    {
      src: "assets/portfolio/house-of-archdes-intro.jpg",
      alt: "House of Archdes Atelier bespoke interior architecture",
      title: "House of Archdes — Atelier",
      subtitle: "Luxury Interior & Spatial Design",
      year: "2025",
      meta: [
        { label: "Discipline", value: "Interior Architecture" },
        { label: "Year", value: "2025" },
        { label: "Scope", value: "Bespoke Millwork, Materials & Lighting" },
      ],
    },
    {
      src: "assets/portfolio/hoa-portal-intro.png",
      alt: "HOA Client Portal architectural web application",
      title: "HOA Client Portal",
      subtitle: "Architectural Ecosystem & Web App",
      year: "2025",
      meta: [
        { label: "Discipline", value: "Digital Architecture & UI/UX" },
        { label: "Year", value: "2025" },
        { label: "Scope", value: "Interactive 3D Client Experience" },
      ],
    },
    {
      src: "assets/portfolio/modern-modules.jpg",
      alt: "Modern Modules sustainable prefab architecture",
      title: "Modern Modules",
      subtitle: "Modular Architecture & Prefab Design",
      year: "2025",
      meta: [
        { label: "Discipline", value: "Sustainable Modular Architecture" },
        { label: "Year", value: "2025" },
        { label: "Scope", value: "Parametric Facades & Prefab Units" },
      ],
    },
    {
      src: "assets/portfolio/anvai-intro.png",
      alt: "AnvAI Generative spatial architecture engine",
      title: "AnvAI Spatial Engine",
      subtitle: "AI-Driven Generative Architecture",
      year: "2024",
      meta: [
        { label: "Discipline", value: "Computational Architecture & AI" },
        { label: "Year", value: "2024" },
        { label: "Scope", value: "Real-Time Algorithmic Geometry" },
      ],
    },
    {
      src: "assets/portfolio/amr-analyst-ai-intro.png",
      alt: "AMR Analyst AI spatial analytics platform",
      title: "AMR Analyst AI",
      subtitle: "Spatial Analytics & 3D Intelligence",
      year: "2024",
      meta: [
        { label: "Discipline", value: "Enterprise Spatial Software" },
        { label: "Year", value: "2024" },
        { label: "Scope", value: "3D Digital Twin & Data Visualization" },
      ],
    },
    {
      src: "assets/portfolio/portfolio-intro.png",
      alt: "Archdes Digital interactive portfolio architecture",
      title: "Archdes Portfolio",
      subtitle: "Interactive 3D Digital Architecture",
      year: "2025",
      meta: [
        { label: "Discipline", value: "WebGL & Creative Engineering" },
        { label: "Year", value: "2025" },
        { label: "Scope", value: "High-Performance Creative Web Experience" },
      ],
    },
  ];

  function createCoverflow(options) {
    const {
      containerId,
      slides = SLIDES,
      rotate = 44,
      depth = 0.6,
      falloff = 0.56,
      fade = 0.1,
      gap = 0.05,
      loop = true,
      showCaption = true,
      showNavigation = true,
      showPagination = true,
      autoPlay = true,
      autoPlayInterval = 3000,
    } = options;

    const root = document.getElementById(containerId);
    if (!root) return;

    const count = slides.length;
    let pos = 0;
    let target = 0;
    let width = 0;
    let raf = null;
    let drag = null;
    let selected = 0;
    let autoPlayTimer = null;
    let resumeTimeout = null;

    function startAutoplay() {
      if (!autoPlay) return;
      stopAutoplay();
      autoPlayTimer = setInterval(() => {
        nudge(1);
      }, autoPlayInterval);
    }

    function stopAutoplay() {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    }

    function pauseAndResume(delay = autoPlayInterval) {
      if (!autoPlay) return;
      stopAutoplay();
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
        resumeTimeout = null;
      }
      resumeTimeout = setTimeout(() => {
        startAutoplay();
      }, delay);
    }

    root.innerHTML = `
      <div class="coverflow-carousel-wrap">
        <div class="coverflow-stage">
          <div class="coverflow-viewport" tabindex="0" role="region" aria-label="Cover carousel">
            <div class="coverflow-track"></div>
          </div>
          ${showNavigation ? `
            <button class="coverflow-nav-btn coverflow-prev" type="button" aria-label="Previous slide">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button class="coverflow-nav-btn coverflow-next" type="button" aria-label="Next slide">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          ` : ''}
        </div>
        ${showCaption ? `<div class="coverflow-caption" aria-live="polite"></div>` : ''}
        ${showPagination ? `<div class="coverflow-pagination" role="tablist"></div>` : ''}
      </div>
    `;

    const viewport = root.querySelector('.coverflow-viewport');
    const track = root.querySelector('.coverflow-track');
    const captionEl = root.querySelector('.coverflow-caption');
    const paginationEl = root.querySelector('.coverflow-pagination');
    const prevBtn = root.querySelector('.coverflow-prev');
    const nextBtn = root.querySelector('.coverflow-next');

    const cardElements = [];
    let isDragging = false;

    // Create cards
    slides.forEach((slide, index) => {
      const card = document.createElement('div');
      card.className = 'coverflow-card';
      card.setAttribute('role', 'group');
      card.setAttribute('aria-roledescription', 'slide');
      card.setAttribute('aria-label', `${index + 1} of ${count}`);
      card.innerHTML = `<img src="${slide.src}" alt="${slide.alt}" draggable="false" loading="lazy">`;
      card.addEventListener('click', (e) => {
        if (isDragging) return;
        goTo(index);
        pauseAndResume();
      });
      track.appendChild(card);
      cardElements.push(card);

      if (showPagination && paginationEl) {
        const dot = document.createElement('button');
        dot.className = `coverflow-dot ${index === 0 ? 'active-dot' : ''}`;
        dot.setAttribute('type', 'button');
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          goTo(index);
          pauseAndResume();
        });
        paginationEl.appendChild(dot);
      }
    });

    const dots = paginationEl ? paginationEl.querySelectorAll('.coverflow-dot') : [];

    const indexAt = (p) => ((Math.round(p) % count) + count) % count;
    const clamp = (p) => (loop ? p : Math.max(0, Math.min(count - 1, p)));

    function updateCaption(index) {
      if (!captionEl) return;
      const active = slides[index];
      if (!active) return;

      let metaHtml = '';
      if (active.meta && active.meta.length) {
        metaHtml = `
          <div class="coverflow-meta">
            ${active.meta.map(m => `
              <div class="coverflow-meta-row">
                <span class="coverflow-meta-label">${m.label}</span>
                <span class="coverflow-meta-val">${m.value}</span>
              </div>
            `).join('')}
          </div>
        `;
      }

      captionEl.innerHTML = `
        <h3 class="coverflow-title">${active.title || ''}</h3>
        <p class="coverflow-subtitle">
          ${active.subtitle ? `<span class="coverflow-category">(${active.subtitle})</span>` : ''}
          ${active.year ? `<span class="coverflow-year">Year- ${active.year}</span>` : ''}
        </p>
        ${metaHtml}
      `;
    }

    function getCardWidth() {
      if (cardElements[0] && cardElements[0].offsetWidth > 0) {
        return cardElements[0].offsetWidth;
      }
      const vpW = viewport && viewport.offsetWidth > 0 ? viewport.offsetWidth : window.innerWidth;
      return Math.min(780, Math.max(320, vpW * 0.55));
    }

    function paint() {
      if (!width) width = getCardWidth();
      const pitch = width * (1 + gap);

      cardElements.forEach((card, index) => {
        let offset = index - pos;
        if (loop) {
          offset = ((offset % count) + count) % count;
          if (offset > count / 2) offset -= count;
        }

        const distance = Math.abs(offset);
        const ramp = Math.pow(distance, falloff);
        const tilt = Math.min(rotate * ramp, 82) * Math.sign(offset);

        card.style.transform =
          `translateX(calc(-50% + ${offset * pitch}px)) ` +
          `translateZ(${-depth * width * ramp}px) rotateY(${-tilt}deg)`;

        const edge = loop ? Math.min(1, Math.max(0, count / 2 - distance)) : 1;
        card.style.opacity = String(Math.max(0, 1 - fade * distance) * edge);
        card.style.zIndex = String(100 - Math.round(distance));

        if (distance < 0.5) {
          card.classList.add('active-card');
        } else {
          card.classList.remove('active-card');
        }
      });

      // Update dots & caption if active index shifts
      const activeIdx = indexAt(pos);
      if (activeIdx !== selected) {
        setSelected(activeIdx);
      }
    }

    function setSelected(newIdx) {
      selected = newIdx;
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active-dot', idx === selected);
      });
      updateCaption(selected);
    }

    function settle(targetPos) {
      if (raf !== null) cancelAnimationFrame(raf);
      target = targetPos;
      setSelected(indexAt(target));

      function step() {
        const remaining = target - pos;
        if (Math.abs(remaining) < 0.0004) {
          pos = target;
          paint();
          raf = null;
          return;
        }
        pos += remaining * 0.16;
        paint();
        raf = requestAnimationFrame(step);
      }
      raf = requestAnimationFrame(step);
    }

    function goTo(index) {
      if (!width) width = getCardWidth();
      const t = loop
        ? index + Math.round((target - index) / count) * count
        : index;
      settle(clamp(t));
    }

    function nudge(by) {
      if (!width) width = getCardWidth();
      settle(clamp(Math.round(target) + by));
    }

    // Pointer Drag Handlers
    viewport.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.coverflow-nav-btn')) return;
      stopAutoplay();
      if (raf !== null) {
        cancelAnimationFrame(raf);
        raf = null;
      }
      isDragging = false;
      viewport.setPointerCapture(e.pointerId);
      target = pos;
      drag = {
        id: e.pointerId,
        x: e.clientX,
        pos: pos,
        v: 0,
        t: performance.now(),
      };
    });

    viewport.addEventListener('pointermove', (e) => {
      if (!drag || drag.id !== e.pointerId) return;
      if (Math.abs(e.clientX - drag.x) > 4) {
        isDragging = true;
      }
      if (!width) width = getCardWidth();
      const pitch = width * (1 + gap);
      if (!pitch) return;

      const now = performance.now();
      const previous = pos;
      pos = clamp(drag.pos - (e.clientX - drag.x) / pitch);
      drag.v = ((pos - previous) / Math.max(now - drag.t, 1)) * 1000;
      drag.t = now;
      paint();
    });

    const endDrag = (e) => {
      if (!drag || drag.id !== e.pointerId) return;
      const v = drag.v;
      drag = null;
      const carried = Math.max(-2, Math.min(2, v * 0.18));
      settle(clamp(Math.round(pos + carried)));
      setTimeout(() => { isDragging = false; }, 60);
      pauseAndResume();
    };

    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);

    // Keyboard navigation
    viewport.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        nudge(-1);
        pauseAndResume();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nudge(1);
        pauseAndResume();
      }
    });

    // Navigation buttons — click pauses autoplay and then continues again after 3s
    if (prevBtn) {
      prevBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
      prevBtn.addEventListener('mousedown', (e) => e.stopPropagation());
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        nudge(-1);
        pauseAndResume();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
      nextBtn.addEventListener('mousedown', (e) => e.stopPropagation());
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        nudge(1);
        pauseAndResume();
      });
    }

    // Measure Card Width
    function measure() {
      width = getCardWidth();
      paint();
    }

    const observer = new ResizeObserver(() => measure());
    observer.observe(viewport);

    // Pause when user switches browser tab, resume when returning
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });

    // Initial render & immediate start of autoplay
    setTimeout(() => {
      measure();
      setSelected(0);
      startAutoplay();
    }, 50);

    return {
      goTo,
      nudge,
      refresh: measure,
      pause: stopAutoplay,
      play: startAutoplay,
    };
  }

  let activeInstance = null;
  window.initCoverflow = function () {
    const root = document.getElementById('portfolioCoverflow');
    if (!root) return null;
    if (activeInstance && root.querySelector('.coverflow-track')) {
      activeInstance.refresh();
      if (typeof activeInstance.play === 'function') activeInstance.play();
      return activeInstance;
    }
    activeInstance = createCoverflow({
      containerId: 'portfolioCoverflow',
      slides: SLIDES,
      showCaption: true,
      showNavigation: true,
      showPagination: true,
      loop: true,
    });
    return activeInstance;
  };
})();
