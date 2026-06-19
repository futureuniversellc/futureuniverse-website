/* ============================================================
   FUTURE UNIVERSE — MAIN JAVASCRIPT
   Navigation, Scroll effects, Hero slider, Cursor
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Custom Cursor ────────────────────────────────────────
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (dot && ring) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    dot.style.transition = 'none';
    function moveCursor() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      dot.style.left  = mx + 'px';
      dot.style.top   = my + 'px';
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(moveCursor);
    }
    moveCursor();
    document.querySelectorAll('a,button,.card,.service-card,.feature-card,.why-feature,.gallery-item').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  // ── Progress Bar ─────────────────────────────────────────
  const progressBar = document.getElementById('progress-bar');
  function updateProgress() {
    if (!progressBar) return;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct   = total > 0 ? (window.scrollY / total * 100) : 0;
    progressBar.style.width = pct + '%';
  }

  // ── Navbar Scroll Behavior ────────────────────────────────
  const navbar   = document.querySelector('.navbar');
  const backTop  = document.getElementById('back-to-top');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const cur = window.scrollY;
    updateProgress();

    if (navbar) {
      if (cur > 80)  navbar.classList.add('scrolled');
      else           navbar.classList.remove('scrolled');
    }

    if (backTop) {
      if (cur > 500) backTop.classList.add('visible');
      else           backTop.classList.remove('visible');
    }
    lastScroll = cur;
  }, { passive: true });

  if (backTop) backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ── Active Nav Link ───────────────────────────────────────
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // ── Mobile Navigation ─────────────────────────────────────
  const hamburger  = document.querySelector('.hamburger');
  const mobileNav  = document.querySelector('.mobile-nav');
  const mobileClose= document.querySelector('.mobile-nav-close');

  function openMobileNav()  {
    mobileNav.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setTimeout(() => mobileNav.classList.add('open'), 10);
    hamburger.classList.add('active');
  }
  function closeMobileNav() {
    mobileNav.classList.remove('open');
    hamburger.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => { if (!mobileNav.classList.contains('open')) mobileNav.style.display = 'none'; }, 400);
  }

  if (hamburger) hamburger.addEventListener('click', () =>
    mobileNav.classList.contains('open') ? closeMobileNav() : openMobileNav()
  );
  if (mobileClose) mobileClose.addEventListener('click', closeMobileNav);
  mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileNav));

  // ── Hero Background Ken Burns ─────────────────────────────
  const hero = document.querySelector('.hero');
  if (hero) {
    setTimeout(() => hero.classList.add('loaded'), 100);
  }

  // ── Scroll Reveal (Intersection Observer) ─────────────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

  // ── Testimonial Slider ────────────────────────────────────
  const track     = document.querySelector('.testimonial-track');
  const prevBtn   = document.querySelector('.slider-btn.prev');
  const nextBtn   = document.querySelector('.slider-btn.next');
  const dots      = document.querySelectorAll('.slider-dot');
  let   slideIdx  = 0;
  let   autoSlide;

  function getVisible() {
    const w = window.innerWidth;
    return w > 1024 ? 3 : w > 768 ? 2 : 1;
  }

  function goToSlide(idx) {
    if (!track) return;
    const cards   = track.querySelectorAll('.testimonial-card');
    const visible = getVisible();
    const max     = Math.max(0, cards.length - visible);
    slideIdx      = Math.max(0, Math.min(idx, max));
    const w       = cards[0] ? cards[0].offsetWidth + 28 : 0;
    track.style.transform = `translateX(-${slideIdx * w}px)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === slideIdx));
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { goToSlide(slideIdx - 1); resetAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goToSlide(slideIdx + 1); resetAuto(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { goToSlide(i); resetAuto(); }));

  function startAuto() {
    autoSlide = setInterval(() => {
      const cards   = track?.querySelectorAll('.testimonial-card');
      const visible = getVisible();
      const max     = cards ? Math.max(0, cards.length - visible) : 0;
      goToSlide(slideIdx >= max ? 0 : slideIdx + 1);
    }, 5000);
  }
  function resetAuto() { clearInterval(autoSlide); startAuto(); }
  if (track) startAuto();
  window.addEventListener('resize', () => goToSlide(slideIdx));

  // ── Hero Image Slider (if multiple slides) ────────────────
  initHeroSlider();

  // ── Newsletter Form ───────────────────────────────────────
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input');
      const btn   = form.querySelector('button');
      if (!input.value.trim()) return;
      btn.innerHTML = '<i class="fa-solid fa-check"></i>';
      btn.style.background = '#22c55e';
      input.value = '';
      setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
        btn.style.background = '';
      }, 3000);
    });
  });

  // ── Contact Form ──────────────────────────────────────────
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const orig = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
      btn.disabled = true;

      const formData = new FormData(contactForm);

      fetch('https://formsubmit.co/ajax/info@futureuniverse.co', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Message Sent!';
        btn.style.background = '#22c55e';
        contactForm.reset();
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.style.background = '';
          btn.disabled = false;
        }, 4000);
      })
      .catch(error => {
        btn.innerHTML = '<i class="fa-solid fa-xmark"></i> Error Sending';
        btn.style.background = '#ef4444';
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.style.background = '';
          btn.disabled = false;
        }, 4000);
      });
    });
  }

  // ── Smooth Scroll for Anchors ─────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Particle Field ────────────────────────────────────────
  document.querySelectorAll('.particle-field').forEach(field => {
    for (let i = 0; i < 12; i++) {
      const p  = document.createElement('div');
      const sz = Math.random() * 6 + 2;
      p.className = 'particle';
      p.style.cssText = `
        width:${sz}px; height:${sz}px;
        left:${Math.random()*100}%;
        animation-duration:${Math.random()*15+10}s;
        animation-delay:${Math.random()*10}s;
      `;
      field.appendChild(p);
    }
  });

  // ── 3D Glass Tilt Effect ──────────────────────────────────
  document.querySelectorAll('.card, .service-card, .feature-card, .testimonial-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotateX = ((y - cy) / cy) * -6; // Max 6 deg tilt
      const rotateY = ((x - cx) / cx) * 6;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

});

// ── Anti-Theft Protection ──────────────────────────────────
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
  if (
    e.key === 'F12' || 
    (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) ||
    (e.ctrlKey && ['U', 'u', 'S', 's'].includes(e.key)) ||
    (e.metaKey && e.altKey && ['I', 'i', 'J', 'j', 'U', 'u'].includes(e.key)) ||
    (e.metaKey && ['S', 's'].includes(e.key))
  ) {
    e.preventDefault();
  }
});

// Disable text selection, except for form inputs
document.body.style.userSelect = 'none';
document.body.style.webkitUserSelect = 'none';
document.addEventListener('selectstart', e => {
  if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault();
  }
});

// ── Hero Slider Logic ──────────────────────────────────────
function initHeroSlider() {
  const slides  = document.querySelectorAll('.hero-slide');
  if (slides.length < 2) return;
  let cur = 0;
  slides[0].classList.add('active');

  setInterval(() => {
    slides[cur].classList.remove('active');
    cur = (cur + 1) % slides.length;
    slides[cur].classList.add('active');
  }, 6000);
}
