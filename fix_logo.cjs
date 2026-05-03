const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

const logoReplacement = `        <div style={{ padding: '0 24px', marginBottom: '30px' }}>
          <img src={logoUrl} alt="Xenon AI" style={{ height: '32px' }} />
        </div>`;

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern for Candidate pages
  const regex1 = /<div style={{ padding: '0 30px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '10px' }}>[\s\S]*?Xr<\/div>\s*<span[^>]*>XENON<\/span>\s*<\/div>/g;
  if (regex1.test(content)) {
    content = content.replace(regex1, logoReplacement);
    modified = true;
  }

  // Pattern for Candidate pages with 30px
  const regex2 = /<div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 30px', marginBottom: '30px' }}>[\s\S]*?Xr\s*<\/div>\s*<span[^>]*>XENON<\/span>\s*<\/div>/g;
  if (regex2.test(content)) {
    content = content.replace(regex2, logoReplacement);
    modified = true;
  }

  if (modified) {
    if (!content.includes("import logoUrl")) {
      content = content.replace(/(import .* from .*;\n)/, `$1import logoUrl from '../assets/logo.svg';\n`);
    }
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
