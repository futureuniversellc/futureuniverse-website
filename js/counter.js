/* ============================================================
   FUTURE UNIVERSE — ANIMATED COUNTERS
   Triggers on scroll using Intersection Observer
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  function animateCounter(el, target, duration = 2000, suffix = '') {
    let start     = null;
    const startVal = 0;

    function step(timestamp) {
      if (!start) start = timestamp;
      const elapsed  = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(ease * target);
      el.textContent = current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else {
        el.textContent = target.toLocaleString() + suffix;
        el.closest('.stat-num, .hero-stat-num')?.classList.add('popped');
      }
    }
    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      if (!isNaN(target)) animateCounter(el, target, 2200, suffix);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-counter]').forEach(el => counterObserver.observe(el));

});
