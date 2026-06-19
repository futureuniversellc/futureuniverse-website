/* ============================================================
   FUTURE UNIVERSE — GALLERY & LIGHTBOX
   Masonry filter + lightbox
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Gallery Filter ────────────────────────────────────────
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      galleryItems.forEach((item, i) => {
        const show = filter === 'all' || item.dataset.category === filter;
        item.style.transition = `opacity 0.4s ${i * 0.04}s, transform 0.4s ${i * 0.04}s`;
        if (show) {
          item.style.opacity = '1';
          item.style.transform = 'scale(1)';
          item.style.display = 'block';
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.9)';
          setTimeout(() => {
            if (btn.dataset.filter !== filter || filter === btn.dataset.filter) {
              // keep in DOM but hidden to preserve masonry
            }
            item.style.display = filter === 'all' || item.dataset.category === btn.dataset.filter ? 'block' : 'none';
          }, 400);
        }
      });
    });
  });

  // ── Lightbox ──────────────────────────────────────────────
  const lightbox     = document.getElementById('lightbox');
  const lightboxImg  = document.getElementById('lightbox-img');
  const lightboxClose= document.querySelector('.lightbox-close');

  if (lightbox && lightboxImg) {
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        if (!img) return;
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(() => { lightboxImg.src = ''; }, 300);
    }

    lightboxClose?.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
  }

});
