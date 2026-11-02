const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const manifest = JSON.parse(read('manifest.json'));
const repo = 'https://github.com/Coursion-Studio/amazon-cart-price-changes';
const raw = 'https://raw.githubusercontent.com/Coursion-Studio/amazon-cart-price-changes/main';
const file = 'amazon-cart-price-changes.user.js';

const header = [
  '// ==UserScript==',
  `// @name         ${manifest.name}`,
  `// @namespace    ${repo}`,
  `// @version      ${manifest.version}`,
  `// @description  ${manifest.description}`,
  `// @author       ${manifest.author}`,
  '// @license      MIT',
  `// @homepageURL  ${repo}`,
  `// @supportURL   ${repo}/issues`,
  `// @icon         ${raw}/icons/icon48.png`,
  `// @updateURL    ${raw}/${file}`,
  `// @downloadURL  ${raw}/${file}`,
  ...manifest.content_scripts[0].matches.map((m) => `// @match        ${m}`),
  '// @run-at       document-idle',
  '// @grant        none',
  '// ==/UserScript==',
  '',
].join('\n');

const css = read('styles.css');
const style = `(function () {\n  var s = document.createElement('style');\n  s.id = 'apc-style';\n  s.textContent = ${JSON.stringify(css)};\n  (document.head || document.documentElement).appendChild(s);\n})();\n`;

const out = header + style + '\n' + read('parse.js') + '\n' + read('content.js');
fs.writeFileSync(path.join(root, file), out);
console.log(file, (out.length / 1024).toFixed(0) + ' KB');
