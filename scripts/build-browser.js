'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'src', 'index.js');
const outputDir = path.join(root, 'dist');
const outputPath = path.join(outputDir, 'puissance-foot-rules.browser.js');
const source = fs.readFileSync(sourcePath, 'utf8')
  .replace(/^'use strict';\s*/, '')
  .replace(/module\.exports = Object\.freeze\(/, 'return Object.freeze(');

const bundle = `/* Puissance Foot Rules v1.0.0 - generated file */\n` +
  `(function (root, factory) {\n` +
  `  root.PuissanceFootRules = factory();\n` +
  `})(typeof globalThis !== 'undefined' ? globalThis : window, function () {\n` +
  `  'use strict';\n${source}\n});\n`;

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, bundle, 'utf8');
console.log(`Built ${path.relative(root, outputPath)}`);
