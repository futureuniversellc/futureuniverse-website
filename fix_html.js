const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\sajha\\OneDrive\\Desktop\\FutureUniverse';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove the specific inline background styles
  content = content.replace(/ style="background:var\(--color-(?:bg|white|primary)\);"/g, '');
  content = content.replace(/<div style="background:var\(--color-primary\);padding:0;">/g, '<div style="padding:0;">');
  
  // Also check contact.html hardcoded color
  content = content.replace(/color:var\(--color-primary\);/g, 'color:var(--color-white);');

  fs.writeFileSync(filePath, content);
});

console.log('HTML files fixed!');
