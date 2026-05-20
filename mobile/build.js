const fs = require('fs');
const path = require('path');

const www = path.join(__dirname, 'www');
const publicDir = path.join(__dirname, '..', 'p2p', 'public');

// Clean www
if (fs.existsSync(www)) fs.rmSync(www, { recursive: true });
fs.mkdirSync(www, { recursive: true });

function copyRecursive(src, dst) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    const s = path.join(src, entry);
    const d = path.join(dst, entry);
    if (fs.statSync(s).isDirectory()) {
      copyRecursive(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

// Copy gun library
copyRecursive(path.join(publicDir, 'gun'), path.join(www, 'gun'));
console.log('  📁 Gun.js copied');

// Copy Leaflet library
copyRecursive(path.join(publicDir, 'lib'), path.join(www, 'lib'));
console.log('  📁 Leaflet copied');

// Copy index.html (already has Capacitor enhancements)
fs.copyFileSync(path.join(publicDir, 'index.html'), path.join(www, 'index.html'));
console.log('  📄 index.html copied');

// Create version file
const pkg = require(path.join(__dirname, 'package.json'));
fs.writeFileSync(path.join(www, 'version.json'), JSON.stringify({
  version: pkg.version,
  apkUrl: 'https://github.com/Xolericuz/ZIYOKOR-NONLARI/releases/download/latest/ziyokor-nonlari.apk',
  updateUrl: 'https://github.com/Xolericuz/ZIYOKOR-NONLARI/releases/latest'
}));
console.log('  📋 version.json created');

console.log('\n  ✅ Build complete → www/');
