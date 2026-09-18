const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function run() {
  const files = fs.readdirSync('images').filter(f => f.endsWith('.png'));
  console.log('Total PNG files:', files.length);
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const meta = await sharp(path.join('images', f)).metadata();
    console.log(`${i+1}. [${meta.width}x${meta.height}] ${f}`);
  }
}
run().catch(console.error);
