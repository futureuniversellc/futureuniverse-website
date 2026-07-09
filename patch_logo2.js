const fs = require('fs');

const currentLogoStr = `<a href="index.html" class="logo" style="display: flex; align-items: center; text-decoration: none;">
  <img src="images/logo.png" alt="Future Universe Logo" style="max-height: 55px; width: auto; display: block;" />
</a>`;

const newLogoStr = `<a href="index.html" class="logo" style="display: flex; align-items: center; text-decoration: none; gap: 12px;">
  <img src="images/logo.png" alt="Future Universe Logo" style="height: 55px; width: 55px; display: block; border-radius: 50%; object-fit: cover; border: 2px solid rgba(212,160,23,0.3);" />
  <div class="logo-text">
    <span class="logo-name">FUTURE UNIVERSE</span>
    <span class="logo-tagline">Empowering People. Building Futures.</span>
  </div>
</a>`;

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes(currentLogoStr)) {
    const updated = content.replaceAll(currentLogoStr, newLogoStr);
    fs.writeFileSync(file, updated);
    console.log(`Updated ${file}`);
  }
});
