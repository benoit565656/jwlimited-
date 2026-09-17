const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processConcept15() {
  const imagesDir = path.join(__dirname, '..', 'images');
  const outOriginal = path.join(__dirname, '..', 'public', 'concepts', 'original');
  const outFull = path.join(__dirname, '..', 'public', 'concepts', 'full');
  const outThumbs = path.join(__dirname, '..', 'public', 'concepts', 'thumbs');

  const item = {
    file: 'ChatGPT Image Sep 17, 2026, 07_01_43 PM.png',
    num: '15',
    code: 'Concept 15',
    title: 'Concept 15 — Treasures of the Philippines',
    subtitle: 'Mayon, Vigan, Banaue, Palawan & Iconic Heritage',
    description: 'A breathtaking panorama of the nation’s greatest wonders: the majestic Mayon Volcano and Banaue Rice Terraces, historic Calle Crisologo in Vigan with a classic kalesa and jeepney, the enchanting Chocolate Hills with a Philippine tarsier, Palawan limestone karsts with traditional outriggers, and a vibrant vinta gliding beneath a glowing Christmas parol.',
    alt_text: 'Four views of Johnnie Walker Blue Label bottle featuring Treasures of the Philippines with Mayon Volcano, Banaue terraces, Vigan colonial street, jeepney, tarsier, Palawan, and glowing Christmas parol.'
  };

  const srcPath = path.join(imagesDir, item.file);
  const slug = 'concept-' + item.num;

  // 1. Copy original
  fs.copyFileSync(srcPath, path.join(outOriginal, slug + '.png'));

  // 2. Full WebP (1536x1024)
  await sharp(srcPath)
    .webp({ quality: 88, effort: 4 })
    .toFile(path.join(outFull, slug + '.webp'));

  // 3. Thumb WebP (600w)
  await sharp(srcPath)
    .resize({ width: 600, fit: 'contain' })
    .webp({ quality: 84, effort: 4 })
    .toFile(path.join(outThumbs, slug + '.webp'));

  console.log('Successfully processed ' + slug + ': ' + item.title);
}

processConcept15().catch(console.error);
