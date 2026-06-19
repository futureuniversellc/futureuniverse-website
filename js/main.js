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
      dot.style.transform  = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
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

  // ── 3D Glass Tilt Effect (Lerp Physics) ───────────────────
  const tiltCards = document.querySelectorAll('.card, .service-card, .feature-card, .testimonial-card, .why-feature');
  
  tiltCards.forEach(card => {
    let bounds;
    let targetX = 0, targetY = 0, targetScale = 1, targetYOffset = 0;
    let currentX = 0, currentY = 0, currentScale = 1, currentYOffset = 0;
    let isHovering = false;
    let rafId = null;

    function update() {
      // Very low multipliers for extreme smoothness and "heavy" floating feel
      currentX += (targetX - currentX) * 0.035;
      currentY += (targetY - currentY) * 0.035;
      currentScale += (targetScale - currentScale) * 0.045;
      currentYOffset += (targetYOffset - currentYOffset) * 0.045;

      card.style.transform = `perspective(1000px) rotateX(${currentX}deg) rotateY(${currentY}deg) translateY(${currentYOffset}px) scale(${currentScale})`;

      if (isHovering || Math.abs(targetX - currentX) > 0.01 || Math.abs(targetScale - currentScale) > 0.001) {
        rafId = requestAnimationFrame(update);
      } else {
        card.style.transform = '';
        card.style.transition = '';
        rafId = null;
      }
    }

    card.addEventListener('mouseenter', () => {
      isHovering = true;
      bounds = card.getBoundingClientRect();
      targetScale = 1.02;
      targetYOffset = -10;
      card.style.transition = 'box-shadow 0.4s, border-color 0.4s, background 0.4s';
      if (!rafId) rafId = requestAnimationFrame(update);
    });

    card.addEventListener('mousemove', e => {
      if (!bounds) bounds = card.getBoundingClientRect();
      const x = e.clientX - bounds.left;
      const y = e.clientY - bounds.top;
      const cx = bounds.width / 2;
      const cy = bounds.height / 2;
      // Reduced the max angle so the slower movement doesn't feel excessive
      targetX = ((y - cy) / cy) * -6;
      targetY = ((x - cx) / cx) * 6;
    });

    card.addEventListener('mouseleave', () => {
      isHovering = false;
      targetX = 0;
      targetY = 0;
      targetScale = 1;
      targetYOffset = 0;
      // Do not reset transition here, let the Lerp loop bring it back smoothly!
    });
  });

  // ── Magnetic Buttons ────────────────────────────────────────
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      // Magnetic pull (reduced strength)
      btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.03)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  // ── Global Hero 3D Parallax ────────────────────────────────
  const heroText = document.querySelector('.hero-text-3d');
  const heroBg = document.querySelector('.hero-bg');
  const particleField = document.querySelector('.particle-field');
  
  if (heroText || heroBg || particleField) {
    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;
    
    document.addEventListener('mousemove', e => {
      // Calculate mouse position relative to center of screen (-1 to 1)
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function updateParallax() {
      // Very soft lerp for dreamy floating
      currentX += (mouseX - currentX) * 0.03;
      currentY += (mouseY - currentY) * 0.03;
      
      // 1. Text tilts towards mouse
      if (heroText) {
        heroText.style.transform = `perspective(1000px) rotateX(${currentY * -15}deg) rotateY(${currentX * 15}deg)`;
      }
      
      // 2. Background shifts away from mouse (Deep background layer)
      if (heroBg) {
        heroBg.style.transform = `scale(1.05) translate(${currentX * -25}px, ${currentY * -25}px)`;
      }
      
      // 3. Particles shift away from mouse, but less than bg (Midground layer)
      if (particleField) {
        particleField.style.transform = `scale(1.05) translate(${currentX * -12}px, ${currentY * -12}px)`;
      }

      requestAnimationFrame(updateParallax);
    }
    updateParallax();
  }

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
