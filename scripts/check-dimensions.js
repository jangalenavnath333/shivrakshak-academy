const fs = require('fs');
const path = require('path');

const getDimensions = (file) => {
  const filePath = path.join(__dirname, '..', 'public', 'images', 'director', file);
  try {
    const buffer = fs.readFileSync(filePath);
    // Basic JPEG parsing for width and height
    let i = 0;
    if (buffer[i] !== 0xFF || buffer[i+1] !== 0xD8) return null; // Not JPEG
    i += 2;
    while (i < buffer.length) {
      if (buffer[i] === 0xFF && buffer[i+1] === 0xC0) {
        // SOF0 block
        const height = buffer.readUInt16BE(i + 5);
        const width = buffer.readUInt16BE(i + 7);
        return { width, height };
      }
      i++;
    }
  } catch (err) {
    return { error: err.message };
  }
  return null;
};

['doc-1.jpg', 'doc-2.jpg', 'doc-3.jpg', 'doc-4.jpg'].forEach(file => {
  console.log(file, getDimensions(file));
});
