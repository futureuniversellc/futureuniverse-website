const fs = require('fs');
const path = require('path');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  
  // Revert nav-cta
  const ctaRegex = /<div class="nav-cta">[\s\S]*?<a href="contact\.html" class="btn btn-primary btn-sm">\s*<i class="fa-solid fa-paper-plane"><\/i> Get in Touch\s*<\/a>\s*<\/div>/;
  const originalCta = `<div class="nav-cta">
      <a href="contact.html" class="btn btn-primary btn-sm">
        <i class="fa-solid fa-paper-plane"></i> Get in Touch
      </a>
    </div>`;
  content = content.replace(ctaRegex, originalCta);

  // Add contact info after hero-btns if it's index.html
  if (f === 'index.html' && !content.includes('hero-contact-info')) {
    content = content.replace(
      /<\/div>\s*<\/div>\s*<div class="hero-stats">/,
      `</div>\n    <div class="hero-contact-info" style="margin-top: 40px; display: flex; align-items: center; gap: 24px; font-size: 0.95rem; color: rgba(255,255,255,0.85); font-weight: 500;">
      <span><i class="fa-solid fa-envelope" style="color: var(--color-secondary); margin-right: 8px;"></i> info@futureuniverse.co</span>
      <span><i class="fa-solid fa-phone" style="color: var(--color-secondary); margin-right: 8px;"></i> +968 94939932</span>
      <span><i class="fa-solid fa-location-dot" style="color: var(--color-secondary); margin-right: 8px;"></i> Muscat, Oman</span>
    </div>\n  </div>\n  <div class="hero-stats">`
    );
  }
  
  fs.writeFileSync(f, content);
  console.log('Reverted and updated ' + f);
});
