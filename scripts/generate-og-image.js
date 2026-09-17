const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function makeOgImage() {
  const width = 1200;
  const height = 630;

  // Paths
  const logoPath = path.join(__dirname, '..', 'public', 'brand', 'logo.webp');
  const conceptPath = path.join(__dirname, '..', 'public', 'concepts', 'original', 'concept-11.png');

  // Resize bottle to fit on the right side cleanly
  const bottleBuffer = await sharp(conceptPath)
    .resize({ height: 570, width: 620, fit: 'contain', background: { r: 18, g: 18, b: 20, alpha: 0 } })
    .toBuffer();

  // Resize logo for crisp display on light luxury pill
  const logoBuffer = await sharp(logoPath)
    .resize({ width: 280, fit: 'contain' })
    .toBuffer();

  // Create SVG text overlay
  const svgText = Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#141416" />
          <stop offset="50%" stop-color="#1A1B1F" />
          <stop offset="100%" stop-color="#0E0E10" />
        </linearGradient>
        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#E5C785" />
          <stop offset="50%" stop-color="#C7A35A" />
          <stop offset="100%" stop-color="#B08D3E" />
        </linearGradient>
      </defs>
      
      <!-- Luxury Background -->
      <rect width="100%" height="100%" fill="url(#bg)" />
      
      <!-- Top Manila Wine Red Accent Bar -->
      <rect x="0" y="0" width="1200" height="8" fill="#9E1B32" />
      
      <!-- Ambient Glows -->
      <circle cx="900" cy="315" r="260" fill="#9E1B32" opacity="0.16" />
      <circle cx="280" cy="220" r="220" fill="#C7A35A" opacity="0.08" />

      <!-- Inner Border -->
      <rect x="24" y="24" width="1152" height="582" rx="12" fill="none" stroke="#C7A35A" stroke-width="1.2" opacity="0.3" />

      <!-- Logo Luxury Ivory Pill (ensures logo text is 100% readable) -->
      <rect x="60" y="60" width="310" height="62" rx="10" fill="#FDFBF7" stroke="#C7A35A" stroke-width="1" stroke-opacity="0.3" />

      <!-- Eyebrow Badge -->
      <rect x="60" y="160" width="280" height="28" rx="14" fill="#222529" stroke="#C7A35A" stroke-width="1" stroke-opacity="0.5" />
      <text x="74" y="179" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#DFBF77" letter-spacing="1.5">100 NUMBERED BOTTLES • VOTE</text>

      <!-- Main Headline -->
      <text x="60" y="245" font-family="Georgia, serif" font-size="38" font-weight="bold" fill="#F7F3EB">A Philippines Edition,</text>
      <text x="60" y="295" font-family="Georgia, serif" font-size="38" font-style="italic" fill="url(#gold)">Chosen by You</text>

      <!-- Subtitle Description -->
      <text x="60" y="355" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" fill="#D1CCC2">
        Help choose the artwork for a proposed 100-bottle
      </text>
      <text x="60" y="380" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" fill="#D1CCC2">
        Johnnie Walker Blue Label Philippines limited edition.
      </text>
      <text x="60" y="405" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" fill="#D1CCC2">
        Explore 11 concept artworks and vote now.
      </text>

      <!-- Action Button -->
      <rect x="60" y="455" width="220" height="48" rx="6" fill="#9E1B32" />
      <text x="170" y="485" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="bold" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">EXPLORE &amp; VOTE NOW</text>
      
      <!-- Footer Attribution -->
      <text x="60" y="555" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#888888">
        jwlimited.manila-wine.com • Manila Wine Collector&apos;s Choice
      </text>
    </svg>
  `);

  // Composite background + SVG text + logo + bottle
  const finalImage = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 20, g: 20, b: 22, alpha: 1 },
    }
  })
  .composite([
    { input: svgText, top: 0, left: 0 },
    { input: logoBuffer, top: 70, left: 75 },
    { input: bottleBuffer, top: 30, left: 550 },
  ]);

  const outJpg = path.join(__dirname, '..', 'public', 'og-image.jpg');
  const outPng = path.join(__dirname, '..', 'public', 'og-image.png');

  // Standard JPEG (100% compatible with Teams, WhatsApp, Skype, Telegram, Facebook, iMessage)
  await finalImage.clone().jpeg({ quality: 94 }).toFile(outJpg);
  await finalImage.clone().png().toFile(outPng);

  console.log('Regenerated pristine OG images:', outJpg, outPng);
}

makeOgImage().catch(console.error);
