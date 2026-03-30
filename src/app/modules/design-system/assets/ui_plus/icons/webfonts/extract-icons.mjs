import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCSS_FILE = path.join(__dirname, './icomoon/variables.scss');
const OUTPUT_FILE = path.join(__dirname, 'icons.json');

const content = fs.readFileSync(SCSS_FILE, 'utf8');

const icons = content
  .split('\n')
  .map(line => {
    const match = line.match(/^\$icon-([a-z0-9-]+):/);
    return match?.[1];
  })
  .filter(Boolean);

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(icons, null, 2));

console.log(`✅ ${icons.length} icons exported to ${OUTPUT_FILE}`);
