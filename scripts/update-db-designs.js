const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '..', 'public', 'concepts', 'manifest.json');
const designs = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

const dbPath = path.join(__dirname, '..', 'src', 'lib', 'db.ts');
let dbContent = fs.readFileSync(dbPath, 'utf-8');

const startMarker = 'const INITIAL_DESIGNS: Design[] = [';
const endMarker = '];\n\nclass LocalDatabase';

const startIndex = dbContent.indexOf(startMarker);
const endIndex = dbContent.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Markers not found in db.ts!');
  process.exit(1);
}

const designsFormatted = 'const INITIAL_DESIGNS: Design[] = ' + JSON.stringify(designs, null, 2);

dbContent = dbContent.slice(0, startIndex) + designsFormatted + dbContent.slice(endIndex);

fs.writeFileSync(dbPath, dbContent, 'utf-8');
console.log('Successfully updated INITIAL_DESIGNS in db.ts with 22 designs.');
