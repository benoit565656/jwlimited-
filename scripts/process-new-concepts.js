const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processNewConcepts() {
  const imagesDir = path.join(__dirname, '..', 'images');
  const outOriginal = path.join(__dirname, '..', 'public', 'concepts', 'original');
  const outFull = path.join(__dirname, '..', 'public', 'concepts', 'full');
  const outThumbs = path.join(__dirname, '..', 'public', 'concepts', 'thumbs');

  const newItems = [
    {
      file: 'ChatGPT Image Sep 17, 2026, 05_48_06 PM.png',
      num: '12',
      code: 'Concept 12',
      title: 'Concept 12 — Bakunawa (The Moon Eater)',
      subtitle: 'Mythology, Moon Phases & Celestial Ocean',
      description: 'A dramatic and sculptural homage to the legendary Philippine celestial serpent, Bakunawa, emerging from tidal swells beneath moon phases, constellations, and starry Philippine skies.',
      alt_text: 'Four views of Johnnie Walker Blue Label bottle featuring the mythological Bakunawa moon-eating dragon serpent with lunar phases and ocean waves.'
    },
    {
      file: 'ChatGPT Image Sep 17, 2026, 05_48_23 PM.png',
      num: '13',
      code: 'Concept 13',
      title: 'Concept 13 — Sarimanok (Messenger of Fortune)',
      subtitle: 'Flowing Feathers & Okir-Inspired Jewel Filigree',
      description: 'An elegant ornamental tribute to the fabled Maranao Sarimanok, adorned in flowing jewel-toned plumes, okir-inspired curves, holding a fish, and soaring beneath the Philippine sun.',
      alt_text: 'Four views of bottle featuring the mythical Sarimanok bird with vibrant turquoise, sapphire, and crimson feathers and golden okir filigree.'
    },
    {
      file: 'ChatGPT Image Sep 17, 2026, 05_48_15 PM.png',
      num: '14',
      code: 'Concept 14',
      title: 'Concept 14 — Ani (The Golden Harvest)',
      subtitle: 'Philippine Folk-Art Heritage & Everyday Icons',
      description: 'A vibrant Philippine folk-print celebration of community and bounty, featuring the hardworking carabao, emerald rice terraces, the Philippine tarsier, a festive jeepney, basketball, and glowing Christmas parol.',
      alt_text: 'Four views of bottle illustrated in bold Philippine folk-art style depicting the carabao, rice terraces, jeepney, basketball, and Christmas parol.'
    }
  ];

  for (const item of newItems) {
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
}

processNewConcepts().catch(console.error);
