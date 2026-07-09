const fs = require('fs');
const path = require('path');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  
  // Remove Top Bar completely
  const topBarRegex = /<!-- ═══════════════════════════════════════════════\r?\n\s*TOP BAR\r?\n═══════════════════════════════════════════════ -->\r?\n<div class="top-bar">[\s\S]*?<\/div>\r?\n<\/div>/;
  content = content.replace(topBarRegex, '');

  // Add contact info to nav-cta
  const ctaRegex = /<div class="nav-cta">\r?\n\s*<a href="contact\.html" class="btn btn-primary btn-sm">/g;
  const newCta = `<div class="nav-cta">
      <a href="mailto:md@futureuniverse.co" class="btn btn-outline-white btn-sm" style="margin-right: 8px; border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.85); padding: 8px 16px;">
        <i class="fa-solid fa-envelope"></i>
      </a>
      <a href="tel:+96812345678" class="btn btn-outline-white btn-sm" style="margin-right: 8px; border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.85); padding: 8px 16px;">
        <i class="fa-solid fa-phone"></i> +968 94939932
      </a>
      <a href="contact.html" class="btn btn-primary btn-sm">`;
      
  content = content.replace(ctaRegex, newCta);
  
  fs.writeFileSync(f, content);
  console.log('Updated ' + f);
});
