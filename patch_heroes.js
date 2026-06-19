const fs = require('fs');
const path = require('path');

const files = [
  'about.html',
  'education.html',
  'hr.html',
  'construction.html',
  'flooring.html',
  'projects.html',
  'blog.html',
  'contact.html'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Find <section class="page-hero" style="...">
  // and replace it with <section class="page-hero"> and insert the inner layers
  
  const heroRegex = /<section\s+class="page-hero"\s+style="(background-image:\s*url\([^)]+\);?)[^"]*"\s*>/i;
  
  if (heroRegex.test(content)) {
    content = content.replace(heroRegex, (match, bgStyle) => {
      return `<section class="page-hero">\n  <div class="hero-bg" style="${bgStyle} opacity: 0.8; mix-blend-mode: luminosity;"></div>\n  <div class="particle-field"></div>`;
    });
  }

  // Also replace <h1> with <h1 class="hero-text-3d"> inside the page-hero-content
  const h1Regex = /(<div class="container page-hero-content">\s*)<h1>/i;
  if (h1Regex.test(content)) {
    content = content.replace(h1Regex, '$1<h1 class="hero-text-3d">');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Patched ${file}`);
});
