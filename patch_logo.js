const fs = require('fs');
const path = require('path');

const regex = /<a href="index\.html" class="logo">\s*<div class="logo-mark">FU<\/div>\s*<div class="logo-text">\s*<span class="logo-name">FUTURE UNIVERSE<\/span>(\s*<span class="logo-tagline">.*?<\/span>)?\s*<\/div>\s*<\/a>/gs;

const replacement = `<a href="index.html" class="logo" style="display: flex; align-items: center; text-decoration: none;">
  <img src="images/logo.png" alt="Future Universe Logo" style="max-height: 55px; width: auto; display: block;" />
</a>`;

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (regex.test(content)) {
    const updated = content.replace(regex, replacement);
    fs.writeFileSync(file, updated);
    console.log(`Updated ${file}`);
  }
});
