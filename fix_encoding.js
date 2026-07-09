const fs = require('fs');
const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  content = content.replaceAll('â€“', '-');
  content = content.replaceAll('â€”', '-');
  content = content.replaceAll('â€™', "'");
  content = content.replaceAll('A,Ac', '©');
  content = content.replaceAll('Â©', '©');
  content = content.replaceAll('A,??', '-');
  content = content.replace(/A\?A\?/g, '─');
  content = content.replace(/â•/g, '─');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed encoding in ${file}`);
  }
});
