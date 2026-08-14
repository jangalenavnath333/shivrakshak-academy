const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'All Data', 'Raje pawar sir', 'IMG_3091.JPG.jpeg');
const dest = path.join(__dirname, '..', 'public', 'images', 'director', 'raje-pawar-army.jpg');

try {
  fs.copyFileSync(src, dest);
  console.log('✅ Raje Pawar Army Photo copied successfully!');
  console.log('   From:', src);
  console.log('   To:  ', dest);
} catch (err) {
  console.error('❌ Error:', err.message);
}
