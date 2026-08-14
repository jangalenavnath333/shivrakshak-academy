const fs = require('fs');
const path = require('path');

const docs = [
  'IMG_20260812_085328.jpg.jpeg',
  'IMG_20260812_085138.jpg.jpeg',
  'IMG_20260812_085044.jpg.jpeg',
  'IMG_20260812_085008.jpg.jpeg'
];

docs.forEach((doc, index) => {
  const src = path.join(__dirname, '..', 'All Data', doc);
  const dest = path.join(__dirname, '..', 'public', 'images', 'director', `doc-${index + 1}.jpg`);

  try {
    fs.copyFileSync(src, dest);
    console.log(`✅ Doc ${index + 1} copied successfully!`);
    console.log('   From:', src);
    console.log('   To:  ', dest);
  } catch (err) {
    console.error(`❌ Error copying doc ${index + 1}:`, err.message);
  }
});
