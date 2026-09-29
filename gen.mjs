import sharp from 'sharp';
await sharp('site/og.svg').png().toFile('site/og.png');
for (const n of [180, 192, 512]) await sharp('site/favicon.svg', { density: 600 }).resize(n, n).png().toFile(`site/icon-${n}.png`);
console.log('images ok');
