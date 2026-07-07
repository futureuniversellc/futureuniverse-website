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
      `;
      showcase.appendChild(card);
    });

    // Show the section
    const section = document.getElementById('clients-showcase-section');
    if (section) section.style.display = '';
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
        <div class="testimonial-stars">★★★★★</div>
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
