'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'dist', 'puissance-foot-rules.browser.js');
const target = path.resolve(
  root,
  '..',
  'sitepuissancefoot',
  'htdocs',
  'js',
  'vendor',
  'puissance-foot-rules.browser.js'
);

if (!fs.existsSync(source)) {
  throw new Error('Run npm run build before sync:site');
}

fs.mkdirSync(path.dirname(target), { recursive: true });
fs.copyFileSync(source, target);
console.log(`Synced browser rules to ${target}`);
