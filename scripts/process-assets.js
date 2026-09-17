const fs = require('fs');
const path = require('path');

// Asset processing script for Manila Wine Collector's Choice
async function main() {
  const sharp = require('sharp');

  const sourceDir = path.join(__dirname, '..', 'images');
  const outOriginal = path.join(__dirname, '..', 'public', 'concepts', 'original');
  const outFull = path.join(__dirname, '..', 'public', 'concepts', 'full');
  const outThumbs = path.join(__dirname, '..', 'public', 'concepts', 'thumbs');

  [outOriginal, outFull, outThumbs].forEach(dir => {
    fs.mkdirSync(dir, { recursive: true });
  });

  // Target 11 concept files in canonical ordered sequence
  const fileNames = [
    'ChatGPT Image Sep 16, 2026, 03_46_30 PM.png',
    'ChatGPT Image Sep 16, 2026, 03_46_41 PM.png',
    'ChatGPT Image Sep 16, 2026, 03_46_48 PM.png',
    'ChatGPT Image Sep 16, 2026, 03_46_54 PM.png',
    'ChatGPT Image Sep 16, 2026, 03_47_00 PM.png',
    'ChatGPT Image Sep 16, 2026, 03_47_05 PM.png',
    'ChatGPT Image Sep 16, 2026, 03_47_10 PM.png',
    'ChatGPT Image Sep 16, 2026, 03_47_16 PM.png',
    'ChatGPT Image Sep 16, 2026, 03_47_38 PM.png',
    'ChatGPT Image Sep 16, 2026, 03_47_44 PM.png',
    'd02d90dc-2103-44d0-ae95-7a249e66f329.png',
  ];

  // Concept catalog metadata curated for Manila Wine Collector's Edition
  const conceptDetails = [
    {
      code: 'Concept 01',
      title: 'Concept 01 — Archipelago Heritage',
      subtitle: 'Flora, Fauna & Sunburst Gold',
      description: 'Lush tropical foliage and Philippine biodiversity intertwined with baroque filigree and the iconic Philippine eight-rayed sun in lustrous embossed gold.',
      alt_text: 'Four views of Johnnie Walker Blue Label bottle featuring golden Philippine flora, sunburst motif, and exotic fauna illustration on deep amber glass.',
    },
    {
      code: 'Concept 02',
      title: 'Concept 02 — Pearl of the Orient',
      subtitle: 'Maritime Azure & Coral Reefs',
      description: 'Deep oceanic cobalt and cerulean gradients depicting Tubbataha Reefs and Philippine marine sanctuary life across the four bottle facets.',
      alt_text: 'Four views of bottle with vibrant turquoise and cobalt blue marine life, coral reefs, and oceanic waves wrapped around the square glass.',
    },
    {
      code: 'Concept 03',
      title: 'Concept 03 — Indigenous Tapestry',
      subtitle: 'Yakan & Inabel Geometric Weaves',
      description: 'Honoring centuries of Philippine master weavers with intricate geometric Inabel and Yakan tribal patterns rendered in etched gold and rich ruby pigments.',
      alt_text: 'Four views of bottle featuring traditional Philippine handwoven geometric tapestry patterns in gold and deep crimson.',
    },
    {
      code: 'Concept 04',
      title: 'Concept 04 — Manila Sunset Elegance',
      subtitle: 'Golden Hour Over Manila Bay',
      description: 'Warm cinnabar, ochre, and burnished gold gradients capturing the legendary sunset of Manila Bay with historic Spanish colonial arches.',
      alt_text: 'Four views of bottle showcasing a dramatic Manila Bay sunset gradient in warm gold, terracotta, and amber with silhouettes of Intramuros.',
    },
    {
      code: 'Concept 05',
      title: 'Concept 05 — Golden Harvest Terroir',
      subtitle: 'Rice Terraces & Tropical Highlands',
      description: 'The monumental Banaue Rice Terraces carved into mountain mist, celebrating northern highland craftsmanship and fertile Philippine valleys.',
      alt_text: 'Four views of bottle illustrating tiered emerald and gold Banaue rice terraces with mountain clouds and indigenous farming heritage.',
    },
    {
      code: 'Concept 06',
      title: 'Concept 06 — Island Fiesta & Floral Tapestry',
      subtitle: 'Baroque Festivity & Sampaguita',
      description: 'Vibrant celebration of nationwide festivities featuring sweet national Sampaguita blooms, cascading bougainvillea, and ceremonial gold trim.',
      alt_text: 'Four views of bottle adorned with blooming Philippine sampaguita flowers, festive fiesta ribbons, and filigree gold leaf.',
    },
    {
      code: 'Concept 07',
      title: 'Concept 07 — Oceanic Depths & Whale Shark',
      subtitle: 'Gentle Giants of Donsol',
      description: 'A serene tribute to the gentle Butanding (whale shark) gliding through translucent cyan waters alongside school of reef fishes.',
      alt_text: 'Four views of bottle featuring majestic whale sharks swimming through azure Philippine waters with deep-sea topography.',
    },
    {
      code: 'Concept 08',
      title: 'Concept 08 — Philippine Sun & Liberty Gold',
      subtitle: 'The 8-Rayed Sun in Radiant Leaf',
      description: 'Bold minimalist luxury featuring the eight rays of the Philippine flag sun boldly wrapped across the shoulder and corners in textured gold leaf.',
      alt_text: 'Four views of bottle highlighting the Philippine golden sun emblem embossed prominently on the glass shoulder and diagonal banner.',
    },
    {
      code: 'Concept 09',
      title: 'Concept 09 — Emerald Cordillera & Highlands',
      subtitle: 'Pristine Mountain Peaks',
      description: 'Rich malachite greens and deep spruce tones evoking the towering pine ridges and mystical peaks of the northern Luzon Cordilleras.',
      alt_text: 'Four views of bottle depicting lush Cordillera pine forests and mountain ridges in rich emerald green with gold accents.',
    },
    {
      code: 'Concept 10',
      title: 'Concept 10 — Tropical Biodiversity Bloom',
      subtitle: 'Endemic Wildlife & Orchids',
      description: 'The Philippine Eagle, Tarsier, and rare Vanda sanderiana (Waling-waling) orchid harmoniously composed in detailed naturalist line art.',
      alt_text: 'Four views of bottle featuring detailed naturalist illustrations of the Philippine Eagle, Tarsier, and Waling-waling orchid.',
    },
    {
      code: 'Concept 11',
      title: 'Concept 11 — Treasures of the Philippines',
      subtitle: 'Constellation Chart & National Landmarks',
      description: 'Dark midnight celestial navigation chart tracing the archipelago from Batanes to Tubbataha, Bohol tarsier, Banaue, Siargao, and Mount Apo with illuminated coordinates.',
      alt_text: 'Four views of bottle featuring a dark celestial constellation map with Philippine island coordinates, iconic landmarks, and golden linework.',
    },
  ];

  const processed = [];

  for (let i = 0; i < fileNames.length; i++) {
    const rawName = fileNames[i];
    const srcPath = path.join(sourceDir, rawName);
    const conceptNum = String(i + 1).padStart(2, '0');
    const slug = `concept-${conceptNum}`;
    
    // Copy original PNG
    const origDest = path.join(outOriginal, `${slug}.png`);
    fs.copyFileSync(srcPath, origDest);

    // Full WebP (1536x1024 preserved aspect ratio)
    const fullWebpPath = path.join(outFull, `${slug}.webp`);
    await sharp(srcPath)
      .webp({ quality: 88, effort: 4 })
      .toFile(fullWebpPath);

    // Thumbnail WebP (600w, height auto 400h)
    const thumbWebpPath = path.join(outThumbs, `${slug}.webp`);
    await sharp(srcPath)
      .resize({ width: 600, fit: 'contain' })
      .webp({ quality: 84, effort: 4 })
      .toFile(thumbWebpPath);

    // Check transparency
    const meta = await sharp(srcPath).metadata();

    processed.push({
      id: `concept-${conceptNum}`,
      code: `Concept ${conceptNum}`,
      sort_order: i + 1,
      title: conceptDetails[i].title,
      subtitle: conceptDetails[i].subtitle,
      description: conceptDetails[i].description,
      alt_text: conceptDetails[i].alt_text,
      has_alpha: Boolean(meta.hasAlpha),
      width: meta.width,
      height: meta.height,
      original_image_path: `/concepts/original/${slug}.png`,
      full_image_path: `/concepts/full/${slug}.webp`,
      thumbnail_path: `/concepts/thumbs/${slug}.webp`,
    });

    console.log(`Processed ${slug}: ${conceptDetails[i].title}`);
  }

  const manifestPath = path.join(__dirname, '..', 'public', 'concepts', 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(processed, null, 2));
  console.log(`Successfully generated manifest with ${processed.length} concepts at ${manifestPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
