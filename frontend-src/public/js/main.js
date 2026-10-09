const $ = s => document.querySelector(s);

// Landing -> Home
window.enterSite = function () {
  const intro = $('#intro');
  if (intro) intro.classList.add('out');
  const site = $('#site');
  if (site) {
    site.hidden = false;
    site.removeAttribute('hidden');
    site.style.display = 'block';
  }
  const hero = $('#hero');
  if (hero) hero.classList.add('in');
  scrollTo(0, 0);
  if (window.vortex) window.vortex.resize();
  setTimeout(() => {
    observe();
    if (typeof window.initCoverflow === 'function') {
      window.initCoverflow();
    }
  }, 350);
};

// Zoom sections in on scroll
function observe() {
  const io = new IntersectionObserver(es => es.forEach(e => {
    e.target.classList.toggle('in', e.isIntersecting);
  }), { threshold: 0.2 });
  document.querySelectorAll('.swirl').forEach(s => io.observe(s));
}

// Nav
const menuBtn = $('#menuBtn');
const menu = $('#menu');
if (menuBtn && menu) {
  menuBtn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  menu.addEventListener('click', () => menu.classList.remove('open'));
}
const yr = $('#yr');
if (yr) yr.textContent = new Date().getFullYear();

// Logo click: return to intro and restart animation from 0s
const logo = $('#logoBtn') || $('.logo');
if (logo) {
  logo.addEventListener('click', e => {
    e.preventDefault();
    if (typeof window.restartIntro === 'function') {
      window.restartIntro();
    } else if (typeof window.replayIntro === 'function') {
      window.replayIntro();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

// Legacy projects element guard
const oldProjectsEl = $('#projects');
if (oldProjectsEl) {
  fetch('/api/projects').then(r => r.json()).then(list => {
    oldProjectsEl.innerHTML = '';
    list.forEach(p => {
      const a = document.createElement('a');
      a.className = 'card';
      const safeUrl = (typeof p.url === 'string' && (p.url.startsWith('http://') || p.url.startsWith('https://') || p.url.startsWith('/'))) ? p.url : '#';
      a.href = safeUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.style.setProperty('--h', p.hue);
      const h = document.createElement('h3'); h.textContent = p.title;
      const s = document.createElement('span'); s.textContent = p.type;
      a.append(h, s); oldProjectsEl.append(a);
    });
  }).catch(() => { oldProjectsEl.textContent = 'Projects could not be loaded.'; });
}

// Contact form
const contactForm = $('#contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const msg = $('#formMsg');
    
    if (btn) btn.disabled = true;
    if (msg) {
      msg.textContent = 'Sending…';
      msg.style.color = '#8fa8ff';
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const formData = new FormData(e.target);
      const payload = {
        name: String(formData.get('name') || '').trim(),
        email: String(formData.get('email') || '').trim(),
        phone: String(formData.get('phone') || '').trim(),
        budget: String(formData.get('budget') || '').trim(),
        message: String(formData.get('message') || '').trim()
      };

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await res.json().catch(() => ({ error: 'Unable to parse server response.' }));
      if (!res.ok) throw new Error(data.error || 'Server error.');

      if (msg) {
        msg.textContent = 'Message sent. We will reply within one business day.';
        msg.style.color = '#4ade80';
      }
      e.target.reset();
    } catch (err) {
      clearTimeout(timeoutId);
      if (msg) {
        msg.textContent = err.name === 'AbortError'
          ? 'Network request timed out. Please check your connection and try again.'
          : (err.message || 'Something went wrong. Please try again.');
        msg.style.color = '#f87171';
      }
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}

// Auto-init coverflow if site is already unhidden (e.g. refreshed or direct view)
document.addEventListener('DOMContentLoaded', () => {
  const site = $('#site');
  if (site && !site.hidden && typeof window.initCoverflow === 'function') {
    window.initCoverflow();
  }
});
