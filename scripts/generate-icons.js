const fs = require('fs');
const path = require('path');

// Create simple SVG icons
const createIcon = (size) => {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#22C55E" rx="${size * 0.1}"/>
  <text x="50%" y="55%" text-anchor="middle" font-family="sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white">$</text>
</svg>`;
};

// Create SVG files
const publicDir = path.join(__dirname, '..', 'public');

// Create 192x192 icon
fs.writeFileSync(path.join(publicDir, 'icon-192.svg'), createIcon(192));

// Create 512x512 icon  
fs.writeFileSync(path.join(publicDir, 'icon-512.svg'), createIcon(512));

console.log('Icons generated successfully!');
console.log('Note: For production, convert these SVGs to PNG or use proper icon files.');