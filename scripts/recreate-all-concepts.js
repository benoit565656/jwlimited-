const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DEFAULT_CAMPAIGN_ID = 'e29d749a-14d2-4ce0-8d59-20f5efc34001';

const conceptsMetadata = [
  {
    num: 1,
    file: 'ChatGPT Image Sep 16, 2026, 03_46_30 PM.png',
    code: 'Concept 01',
    title: 'Concept 01 — Archipelago Heritage',
    subtitle: 'Flora, Fauna & Sunburst Gold',
    description: 'Lush tropical foliage and Philippine biodiversity intertwined with baroque filigree and the iconic Philippine eight-rayed sun in lustrous embossed gold.',
    alt_text: 'Four views of Johnnie Walker Blue Label bottle featuring golden Philippine flora, sunburst motif, and exotic fauna illustration on deep amber glass.',
  },
  {
    num: 2,
    file: 'ChatGPT Image Sep 16, 2026, 03_46_41 PM.png',
    code: 'Concept 02',
    title: 'Concept 02 — Pearl of the Orient',
    subtitle: 'Maritime Azure & Coral Reefs',
    description: 'Deep oceanic cobalt and cerulean gradients depicting Tubbataha Reefs and Philippine marine sanctuary life across the four bottle facets.',
    alt_text: 'Four views of bottle with vibrant turquoise and cobalt blue marine life, coral reefs, and oceanic waves wrapped around the square glass.',
  },
  {
    num: 3,
    file: 'ChatGPT Image Sep 16, 2026, 03_46_48 PM.png',
    code: 'Concept 03',
    title: 'Concept 03 — Indigenous Tapestry',
    subtitle: 'Yakan & Inabel Geometric Weaves',
    description: 'Honoring centuries of Philippine master weavers with intricate geometric Inabel and Yakan tribal patterns rendered in etched gold and rich ruby pigments.',
    alt_text: 'Four views of bottle featuring traditional Philippine handwoven geometric tapestry patterns in gold and deep crimson.',
  },
  {
    num: 4,
    file: 'ChatGPT Image Sep 16, 2026, 03_46_54 PM.png',
    code: 'Concept 04',
    title: 'Concept 04 — Manila Sunset Elegance',
    subtitle: 'Golden Hour Over Manila Bay',
    description: 'Warm cinnabar, ochre, and burnished gold gradients capturing the legendary sunset of Manila Bay with historic Spanish colonial arches.',
    alt_text: 'Four views of bottle showcasing a dramatic Manila Bay sunset gradient in warm gold, terracotta, and amber with silhouettes of Intramuros.',
  },
  {
    num: 5,
    file: 'ChatGPT Image Sep 16, 2026, 03_47_00 PM.png',
    code: 'Concept 05',
    title: 'Concept 05 — Fort Santiago & Intramuros',
    subtitle: 'The Walled City Heritage',
    description: 'Weathered Spanish stonework, neoclassical balustrades, and historic ironwork silhouettes paying tribute to Intramuros and Manila’s four-hundred-year chronicle.',
    alt_text: 'Four views of bottle with Spanish colonial stone bastion gates, ornate wrought-iron lanterns, and neoclassical arches etched in gold.',
  },
  {
    num: 6,
    file: 'ChatGPT Image Sep 16, 2026, 03_47_05 PM.png',
    code: 'Concept 06',
    title: 'Concept 06 — King of the Road',
    subtitle: 'Jeepney Chrome & Chromatic Pop-Art',
    description: 'Dynamic chrome filigree and vibrant festival hues celebrating the irrepressible Philippine jeepney—an enduring monument to ingenuity and urban mobility.',
    alt_text: 'Four views of bottle showcasing ornate chrome hood ornaments, festive hand-painted typography, and vibrant fiesta ribbons of the Philippine jeepney.',
  },
  {
    num: 7,
    file: 'ChatGPT Image Sep 16, 2026, 03_47_10 PM.png',
    code: 'Concept 07',
    title: 'Concept 07 — Bohol Sanctuary',
    subtitle: 'Chocolate Hills & The Nocturnal Tarsier',
    description: 'The surreal conical mounds of Bohol cloaked in seasonal bronze hues, cradling the nocturnal Philippine tarsier nestled among dew-kissed emerald fronds.',
    alt_text: 'Four views of bottle with rolling chocolate hills and wide-eyed Philippine tarsier clinging to bamboo shoots in sepia and olive tones.',
  },
  {
    num: 8,
    file: 'ChatGPT Image Sep 16, 2026, 03_47_16 PM.png',
    code: 'Concept 08',
    title: 'Concept 08 — Stairways to Heaven',
    subtitle: 'Ifugao Rice Terraces of Banaue',
    description: 'Two thousand years of ancestral engineering rendered in rippling emerald and gold contours ascending through mist-shrouded Cordillera peaks.',
    alt_text: 'Four views of bottle featuring stepped terraces carved into mountain slopes with mist clouds and morning sunlight rendered in green and gold leaf.',
  },
  {
    num: 9,
    file: 'ChatGPT Image Sep 16, 2026, 03_47_38 PM.png',
    code: 'Concept 09',
    title: 'Concept 09 — The Perfect Cone',
    subtitle: 'Mayon Volcano & Albay Horizon',
    description: 'The legendary symmetry of Mount Mayon rising in volcanic majesty against dusk skies, with ember filigree and fertile Bicol volcanic soils below.',
    alt_text: 'Four views of bottle presenting symmetrical volcanic cone with wisps of smoke, Cagsawa ruins silhouette, and twilight violet and terracotta sky.',
  },
  {
    num: 10,
    file: 'ChatGPT Image Sep 16, 2026, 03_47_44 PM.png',
    code: 'Concept 10',
    title: 'Concept 10 — Lord of the Skies',
    subtitle: 'The Sovereign Philippine Eagle',
    description: 'Spanning four facets, the magnificent Haribon spreads its crowned crest across ancient dipterocarp forest canopies in etched burnished platinum and gold.',
    alt_text: 'Four views of bottle depicting majestic Philippine eagle with outspread feathers and crowned crest over tropical mountain rainforest canopy.',
  },
  {
    num: 11,
    file: 'd02d90dc-2103-44d0-ae95-7a249e66f329.png',
    code: 'Concept 11',
    title: 'Concept 11 — The Pintados Warriors',
    subtitle: 'Ancient Visayan Tattoo Mastery',
    description: 'Bold geometric body-art of pre-colonial Visayan warriors, depicting bravery, spiritual protection, and sacred ancestral lineages hand-etched in gold leaf.',
    alt_text: 'Four views of bottle adorned with sharp geometric Visayan tribal tattoo patterns, sacred solar emblems, and protective warrior talismans in gold.',
  },
  {
    num: 12,
    file: 'ChatGPT Image Sep 17, 2026, 04_09_58 PM.png',
    code: 'Concept 12',
    title: 'Concept 12 — Butanding & Sovereign Eagle',
    subtitle: 'Gentle Giants, Mountain Terraces & Coral Bays',
    description: 'A majestic fusion of Philippine apex wonders: the gentle Whale Shark gliding through coral sanctuaries, crowned Philippine Eagle soaring over rice terraces, carabao, and festive jeepney.',
    alt_text: 'Four views of Johnnie Walker bottle illustrated with whale shark, Philippine eagle, carabao, and Banaue terraces.',
  },
  {
    num: 13,
    file: 'ChatGPT Image Sep 17, 2026, 04_55_28 PM.png',
    code: 'Concept 13',
    title: 'Concept 13 — Parol & Capiz Luminescence',
    subtitle: 'Stained Glass Cathedral & Golden Sunburst',
    description: 'A radiant architectural celebration of Philippine festive light, featuring translucent Capiz shell tessellations, cathedral stained-glass geometry, and an eight-rayed sun in brilliant jewel tones.',
    alt_text: 'Four views of bottle featuring glowing Capiz shell star, stained-glass mosaic panels, and golden Philippine sunburst.',
  },
  {
    num: 14,
    file: 'ChatGPT Image Sep 17, 2026, 05_20_08 PM.png',
    code: 'Concept 14',
    title: 'Concept 14 — Habi & Hardcourt',
    subtitle: 'Ancestral Weaving & Barangay Basketball',
    description: 'An authentic portrait of modern Philippine life blending the timeless art of indigenous loom weaving with the nation’s heartbeat passion for neighborhood basketball, tarsiers, and colorful jeepneys.',
    alt_text: 'Four views of bottle featuring ancestral woven ribbon flowing into a basketball court with Mayon volcano, jeepney, and tarsier.',
  },
  {
    num: 15,
    file: 'ChatGPT Image Sep 18, 2026, 08_31_50 AM.png',
    code: 'Concept 15',
    title: 'Concept 15 — Treasures of the Philippines',
    subtitle: 'Mayon, Intramuros, Vinta & Manila Jeepney',
    description: 'The definitive panoramic journey through Philippine identity: Mayon Volcano, Banaue terraces, Intramuros colonial kalesa, vibrant jeepney, Bohol tarsier, and sunset sailing Vinta in rich collector presentation.',
    alt_text: 'Four views of Johnnie Walker Blue Label Treasures of the Philippines collector edition bottle on silver-reflective luxury studio setting.',
  },
  {
    num: 16,
    file: 'ChatGPT Image Sep 18, 2026, 10_46_57 AM.png',
    code: 'Concept 16',
    title: 'Concept 16 — Bakunawa The Moon Eater',
    subtitle: 'Celestial Serpent & Lunar Constellations',
    description: 'The mythical Philippine cosmic dragon Bakunawa emerging from deep cerulean ocean waves, encircling lunar phases and starry constellations across the four facets of the bottle in lustrous gold and lapis lazuli.',
    alt_text: 'Four views of bottle featuring the mythological Bakunawa sea serpent coiling around lunar phases with gold scales and starry night sky.',
  },
  {
    num: 17,
    file: 'ChatGPT Image Sep 18, 2026, 11_11_29 AM.png',
    code: 'Concept 17',
    title: 'Concept 17 — Ani Golden Harvest',
    subtitle: 'Carabao, Emerald Terraces & Christmas Parol',
    description: 'A celebration of community bounty and Philippine folk-art spirit, featuring the revered water buffalo in blue porcelain filigree, emerald Cordillera paddies, festive jeepney riders, and a glowing Christmas star.',
    alt_text: 'Four views of bottle featuring water buffalo with filigree motifs, terraced rice paddies, joyful jeepney, and festive Christmas parol.',
  },
  {
    num: 18,
    file: 'ChatGPT Image Sep 18, 2026, 11_11_42 AM.png',
    code: 'Concept 18',
    title: 'Concept 18 — Sarimanok Messenger of Fortune',
    subtitle: 'Maranao Royal Plumes & Golden Okir',
    description: 'The legendary Maranao totem bird of good fortune and prosperity, adorned with flowing jewel-toned plumes of emerald, sapphire, and ruby, grasping a silver fish amidst golden okir scrolls and the crescent moon.',
    alt_text: 'Four views of bottle featuring the mythological Sarimanok bird with vibrant okir filigree feathers, golden sun, and crescent moon.',
  },
  {
    num: 19,
    file: 'ChatGPT Image Sep 18, 2026, 11_14_32 AM.png',
    code: 'Concept 19',
    title: 'Concept 19 — Tinikling & Mayon Sunset',
    subtitle: 'National Bamboo Dance & Soaring Haribon',
    description: 'Capturing the rhythmic grace of the Tinikling bamboo dancers in traditional baro\'t saya, accompanied by kulintang gongs, the sovereign Philippine eagle, and a vibrant Vinta gliding before Mount Mayon.',
    alt_text: 'Four views of bottle depicting Tinikling bamboo dancers, Philippine eagle in flight, colorful Vinta boat, and fiery Mayon sunset.',
  },
  {
    num: 20,
    file: 'ChatGPT Image Sep 18, 2026, 11_14_43 AM.png',
    code: 'Concept 20',
    title: 'Concept 20 — Palawan Marine & Wild Sanctuaries',
    subtitle: 'Dugong, Sea Turtle, Tamaraw & Philippine Crocodile',
    description: 'An extraordinary tribute to the Philippines\' most endangered and sacred wildlife, featuring the rare Palawan Dugong, hawksbill sea turtle, Mindoro tamaraw, Philippine eagle, and Mindoro freshwater crocodile.',
    alt_text: 'Four views of bottle featuring underwater ocean life with dugong and sea turtle on one side, and rainforest with eagle, tamaraw, and crocodile on the other.',
  },
  {
    num: 21,
    file: 'ChatGPT Image Sep 18, 2026, 11_14_51 AM.png',
    code: 'Concept 21',
    title: 'Concept 21 — MassKara & Singkil Royalty',
    subtitle: 'Bacolod Smiling Masks & Royal Fan Dance',
    description: 'Vibrant cultural pageantry honoring Bacolod\'s world-famous MassKara Festival smiling mask adorned in feathers and Capiz shells, alongside the royal Singkil princess dance and kulintang gong ensemble.',
    alt_text: 'Four views of bottle featuring elaborate MassKara festival mask, Singkil royal fan dancers, kulintang musicians, and shimmering Capiz shell accents.',
  },
  {
    num: 22,
    file: 'ChatGPT Image Sep 18, 2026, 12_52_41 PM.png',
    code: 'Concept 22',
    title: 'Concept 22 — Bayanihan & Heart of the Game',
    subtitle: 'Tarsier, Terraces & Neighborhood Passion',
    description: 'A striking contemporary celebration of the Filipino spirit, connecting ancestral mountain heritage, lush tropical highlands, and delicate tarsiers with the vibrant urban heartbeat of barangay basketball and artisan weaving.',
    alt_text: 'Four views of Johnnie Walker Blue Label bottle featuring weaving hands, tarsier in rice terraces, and basketball player shooting under Christmas parol.',
  },
];

async function main() {
  const imagesDir = path.join(__dirname, '..', 'images');
  const outOriginal = path.join(__dirname, '..', 'public', 'concepts', 'original');
  const outFull = path.join(__dirname, '..', 'public', 'concepts', 'full');
  const outThumbs = path.join(__dirname, '..', 'public', 'concepts', 'thumbs');

  [outOriginal, outFull, outThumbs].forEach((d) => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  const fullDesigns = [];

  for (const item of conceptsMetadata) {
    const srcPath = path.join(imagesDir, item.file);
    if (!fs.existsSync(srcPath)) {
      console.error('File missing:', srcPath);
      continue;
    }

    const padNum = String(item.num).padStart(2, '0');
    const slug = `concept-${padNum}`;

    // 1. Copy Original PNG
    const origPath = path.join(outOriginal, `${slug}.png`);
    fs.copyFileSync(srcPath, origPath);

    // 2. Generate Full WebP
    const fullWebpPath = path.join(outFull, `${slug}.webp`);
    await sharp(srcPath)
      .webp({ quality: 88, effort: 4 })
      .toFile(fullWebpPath);

    // 3. Generate Thumbnail WebP
    const thumbWebpPath = path.join(outThumbs, `${slug}.webp`);
    await sharp(srcPath)
      .resize({ width: 600, fit: 'contain' })
      .webp({ quality: 84, effort: 4 })
      .toFile(thumbWebpPath);

    const uuid = `c0000000-0000-0000-0000-${String(item.num).padStart(12, '0')}`;

    fullDesigns.push({
      id: uuid,
      campaign_id: DEFAULT_CAMPAIGN_ID,
      code: item.code,
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      alt_text: item.alt_text,
      original_image_path: `/concepts/original/${slug}.png`,
      full_image_path: `/concepts/full/${slug}.webp`,
      thumbnail_path: `/concepts/thumbs/${slug}.webp`,
      sort_order: item.num,
      is_published: true,
      created_at: '2026-09-16T12:41:02.348Z',
      updated_at: new Date().toISOString(),
    });

    console.log(`[${padNum}/22] Successfully processed ${slug}: ${item.title}`);
  }

  // Write Manifest
  const manifestPath = path.join(__dirname, '..', 'public', 'concepts', 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(fullDesigns, null, 2));
  console.log(`Manifest saved with ${fullDesigns.length} designs.`);

  // Update data/store.json
  const storePath = path.join(__dirname, '..', 'data', 'store.json');
  if (fs.existsSync(storePath)) {
    const store = JSON.parse(fs.readFileSync(storePath, 'utf-8'));
    // Preserve existing votes
    store.designs = fullDesigns;
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
    console.log(`Updated data/store.json with all ${fullDesigns.length} designs.`);
  }

  console.log('ALL 22 DESIGNS RECREATED AND PERSISTED SUCCESSFULLY!');
}

main().catch(console.error);
