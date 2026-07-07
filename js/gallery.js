/* ============================================================
   FUTURE UNIVERSE — GALLERY & LIGHTBOX
   Masonry filter + lightbox
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Gallery Filter ────────────────────────────────────────
  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('project-search-input');
  
  function applyFilters() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const activeBtn = document.querySelector('.filter-btn.active');
    const filter = activeBtn ? activeBtn.dataset.filter : 'all';
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    galleryItems.forEach((item, i) => {
      const categoryMatch = filter === 'all' || item.dataset.category === filter;
      const textMatch = searchTerm === '' || item.textContent.toLowerCase().includes(searchTerm);
      const show = categoryMatch && textMatch;
      
      item.style.transition = `opacity 0.4s ${i * 0.04}s, transform 0.4s ${i * 0.04}s`;
      if (show) {
        item.style.opacity = '1';
        item.style.transform = 'scale(1)';
        item.style.display = 'block';
      } else {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.9)';
        setTimeout(() => {
          // Double check it's still hidden before setting display:none
          if (item.style.opacity === '0') {
            item.style.display = 'none';
          }
        }, 400);
      }
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  document.addEventListener('projectsLoaded', () => {
    applyFilters();
  });

  // ── Lightbox ──────────────────────────────────────────────
  window.initLightbox = function() {
    const lightbox     = document.getElementById('lightbox');
    const lightboxImg  = document.getElementById('lightbox-img');
    const lightboxClose= document.querySelector('.lightbox-close');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (lightbox && lightboxImg) {
      galleryItems.forEach(item => {
        // Prevent multiple listeners if re-initialized
        const clone = item.cloneNode(true);
        item.parentNode.replaceChild(clone, item);
        clone.addEventListener('click', () => {
          const img = clone.querySelector('img');
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

      // Re-attach close listeners safely
      const oldClose = lightboxClose.cloneNode(true);
      lightboxClose.parentNode.replaceChild(oldClose, lightboxClose);
      oldClose.addEventListener('click', closeLightbox);
      
      const oldLightbox = lightbox.cloneNode(true);
      lightbox.parentNode.replaceChild(oldLightbox, lightbox);
      oldLightbox.addEventListener('click', e => { if (e.target === oldLightbox) closeLightbox(); });
      
      document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); }, { once: true });
    }
  };

  // Run initial setup
  initLightbox();

});
