/* ============================================================
   FUTURE UNIVERSE — PUBLIC CLIENTS LOADER
   Fetches client data from Firestore and renders on the
   public website (homepage ticker, clients section, etc.)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Load Featured Clients into Partners Ticker ─────────────
  async function loadPublicClients() {
    try {
      const snapshot = await db.collection('clients')
        .orderBy('createdAt', 'desc')
        .get();

      const clients = [];
      snapshot.forEach(doc => {
        clients.push({ id: doc.id, ...doc.data() });
      });

      if (clients.length > 0) {
        renderPartnersTicker(clients);
        renderClientsShowcase(clients.filter(c => c.featured));
        renderClientTestimonials(clients.filter(c => c.testimonial));
        renderHomeProjectsPreview(clients);
        renderCategoryProjectsPreview(clients);
        renderAllProjects(clients);
      }
    } catch (err) {
      console.warn('Clients: Could not load from Firestore, using static content.', err);
    }
  }

  // ── Render Partners Ticker (replace static content) ────────
  function renderPartnersTicker(clients) {
    const tickerTrack = document.querySelector('.ticker-track');
    if (!tickerTrack) return;

    // Build ticker items from dynamic clients
    const icons = {
      'Oil & Gas': 'fa-solid fa-oil-well',
      'Government': 'fa-solid fa-landmark',
      'Healthcare': 'fa-solid fa-hospital',
      'Education': 'fa-solid fa-school',
      'Construction': 'fa-solid fa-building',
      'Hospitality': 'fa-solid fa-hotel',
      'Logistics': 'fa-solid fa-truck',
      'Finance': 'fa-solid fa-coins',
      'Technology': 'fa-solid fa-microchip',
      'Real Estate': 'fa-solid fa-city',
      'Retail': 'fa-solid fa-store',
      'Manufacturing': 'fa-solid fa-industry',
      'Other': 'fa-solid fa-briefcase'
    };

    let tickerHTML = '';
    clients.forEach(client => {
      const icon = icons[client.industry] || 'fa-solid fa-building';
      tickerHTML += `<div class="ticker-item"><i class="${icon}"></i> ${escapeHtml(client.name)}</div>`;
    });

    // Duplicate for seamless loop
    tickerTrack.innerHTML = tickerHTML + tickerHTML;
  }

  // ── Render Featured Clients Showcase ───────────────────────
  function renderClientsShowcase(featured) {
    const showcase = document.getElementById('clients-showcase-grid');
    if (!showcase || featured.length === 0) return;

    showcase.innerHTML = '';
    featured.forEach(client => {
      const card = document.createElement('div');
      card.className = 'client-showcase-card';
      card.innerHTML = `
        <div class="client-showcase-logo">
          ${client.logoUrl
            ? `<img src="${client.logoUrl}" alt="${escapeHtml(client.name)}" loading="lazy"/>`
            : `<span class="client-showcase-initials">${getInitials(client.name)}</span>`
          }
        </div>
        <h4>${escapeHtml(client.name)}</h4>
        <span class="client-showcase-industry">${escapeHtml(client.industry || '')}</span>
        ${client.description ? `<p>${escapeHtml(client.description)}</p>` : ''}
        ${client.projectPhotos && client.projectPhotos.length > 0 ? `
          <div class="client-showcase-gallery">
            ${client.projectPhotos.slice(0, 3).map(photo => `<div class="client-gallery-img"><img src="${photo}" loading="lazy"/></div>`).join('')}
            ${client.projectPhotos.length > 3 ? `<div class="client-gallery-more">+${client.projectPhotos.length - 3}</div>` : ''}
          </div>
        ` : ''}
      `;
      showcase.appendChild(card);
    });

    // Show the section
    const section = document.getElementById('clients-showcase-section');
    if (section) section.style.display = '';
  }

  // ── Render Home Projects Preview ───────────────────────────
  function renderHomeProjectsPreview(clients) {
    const grid = document.getElementById('home-projects-grid');
    if (!grid) return;

    let allProjects = [];
    clients.forEach(client => {
      if (client.projectPhotos && client.projectPhotos.length > 0) {
        client.projectPhotos.forEach((photo, idx) => {
          allProjects.push({
            photo,
            clientName: client.name,
            industry: client.industry,
            category: (client.industry || 'other').toLowerCase().replace(/[^a-z]/g, '')
          });
        });
      }
    });

    // Shuffle and pick 4
    allProjects = allProjects.sort(() => 0.5 - Math.random()).slice(0, 4);
    if (allProjects.length === 0) return;

    grid.innerHTML = '';
    allProjects.forEach((proj, i) => {
      const item = document.createElement('div');
      item.className = 'gallery-item';
      item.dataset.category = proj.category;
      item.dataset.reveal = 'fade-in';
      item.dataset.delay = String(100 + (i * 50));
      item.innerHTML = `
        <img src="${proj.photo}" alt="${escapeHtml(proj.clientName)} Project" loading="lazy"/>
        <div class="gallery-item-overlay">
          <i class="fa-solid fa-expand"></i>
          <span>${escapeHtml(proj.clientName)}<br><small style="opacity:0.7;font-weight:400;">${escapeHtml(proj.industry)}</small></span>
        </div>
      `;
      grid.appendChild(item);
    });

    const section = document.getElementById('home-projects-section');
    if (section) section.style.display = '';
  }

  // ── Render Category Projects Preview (for service pages) ──
  function renderCategoryProjectsPreview(clients) {
    const grid = document.getElementById('category-projects-grid');
    if (!grid) return;

    const targetCategory = grid.dataset.projectsCategory || '';
    if (!targetCategory) return;

    let catProjects = [];
    clients.forEach(client => {
      const clientCat = (client.industry || 'other').toLowerCase().replace(/[^a-z]/g, '');
      if (clientCat === targetCategory && client.projectPhotos && client.projectPhotos.length > 0) {
        client.projectPhotos.forEach(photo => {
          catProjects.push({ photo, clientName: client.name, industry: client.industry });
        });
      }
    });

    catProjects = catProjects.slice(0, 4);
    if (catProjects.length === 0) return;

    grid.innerHTML = '';
    catProjects.forEach((proj, i) => {
      const item = document.createElement('div');
      item.className = 'gallery-item';
      item.dataset.reveal = 'fade-in';
      item.dataset.delay = String(100 + (i * 50));
      item.innerHTML = `
        <img src="${proj.photo}" alt="${escapeHtml(proj.clientName)} Project" loading="lazy"/>
        <div class="gallery-item-overlay">
          <i class="fa-solid fa-expand"></i>
          <span>${escapeHtml(proj.clientName)}</span>
        </div>
      `;
      grid.appendChild(item);
    });

    const section = document.getElementById('category-projects-section');
    if (section) section.style.display = '';
    
    // Re-initialize lightbox for new images
    if (typeof initLightbox === 'function') initLightbox();
  }

  // ── Render All Projects (for projects.html) ───────────────
  function renderAllProjects(clients) {
    const grid = document.getElementById('all-projects-grid');
    if (!grid) return;

    let allProjects = [];
    clients.forEach(client => {
      if (client.projectPhotos && client.projectPhotos.length > 0) {
        client.projectPhotos.forEach(photo => {
          allProjects.push({
            photo,
            clientName: client.name,
            industry: client.industry,
            category: (client.industry || 'other').toLowerCase().replace(/[^a-z]/g, '')
          });
        });
      }
    });

    if (allProjects.length === 0) return;

    grid.innerHTML = '';
    allProjects.forEach((proj, i) => {
      const item = document.createElement('div');
      item.className = 'gallery-item';
      item.dataset.category = proj.category;
      item.innerHTML = `
        <img src="${proj.photo}" alt="${escapeHtml(proj.clientName)} Project" loading="lazy"/>
        <div class="gallery-item-overlay">
          <i class="fa-solid fa-expand"></i>
          <span>${escapeHtml(proj.clientName)}<br><small style="opacity:0.7;font-weight:400;">${escapeHtml(proj.industry)}</small></span>
        </div>
      `;
      grid.appendChild(item);
    });

    // Fire a custom event so gallery.js knows they are loaded and can attach search/filter logic
    document.dispatchEvent(new Event('projectsLoaded'));
    if (typeof initLightbox === 'function') initLightbox();
  }

  // ── Render Client Testimonials ─────────────────────────────
  function renderClientTestimonials(withTestimonials) {
    const track = document.querySelector('.testimonial-track');
    if (!track || withTestimonials.length === 0) return;

    // Append dynamic testimonials to existing ones or replace
    withTestimonials.forEach(client => {
      const card = document.createElement('div');
      card.className = 'testimonial-card';
      card.setAttribute('data-reveal', 'fade-up');
      const initials = getInitials(client.contact || client.name);
      card.innerHTML = `
        <div class="testimonial-stars">${renderStars(client.testimonialRating)}</div>
        <p class="testimonial-text">"${escapeHtml(client.testimonial)}"</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar">${initials}</div>
          <div>
            <div class="testimonial-name">${escapeHtml(client.contact || client.name)}</div>
            <div class="testimonial-role">${escapeHtml(client.name)}</div>
          </div>
        </div>
      `;
      track.appendChild(card);
    });
  }

  // ── Utilities ──────────────────────────────────────────────
  function renderStars(rating) {
    const n = Math.min(5, Math.max(1, parseInt(rating) || 5));
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Init ───────────────────────────────────────────────────
  // Only load if Firebase is configured (not placeholder)
  if (typeof db !== 'undefined' && firebaseConfig && firebaseConfig.apiKey !== 'YOUR_API_KEY') {
    loadPublicClients();
  }

});
