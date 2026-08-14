// Run this with: node scripts/copy-mahadik-photo.js
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'All Data', 'Raje pawar sir', 'Mahadik sir', 'WhatsApp Image 2026-08-13 at 11.36.55 PM.jpeg');
const dest = path.join(__dirname, '..', 'public', 'images', 'director', 'sambhaji-mahadik-yodha.jpg');

try {
  fs.copyFileSync(src, dest);
  console.log('✅ Photo copied successfully!');
  console.log('   From:', src);
  console.log('   To:  ', dest);
} catch (err) {
  console.error('❌ Error:', err.message);
}
