// Regression guard for MinKoi mobile CSS. No external dependencies.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const file = path.resolve(__dirname, '../../css/style-responsive.css');
const source = fs.readFileSync(file, 'utf8');
// Preserve line positions while discarding comments/quoted values before balancing.
const clean = source.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
const stack = [];
for (let i = 0; i < clean.length; i++) {
    if (clean[i] === '{') stack.push(i);
    if (clean[i] === '}') {
        if (!stack.length) throw new Error('Unexpected closing } in mobile CSS at offset ' + i);
        stack.pop();
    }
}
if (stack.length) throw new Error('Unclosed CSS block(s): ' + stack.length);
const media = '@media (max-width: 860px)';
const start = clean.indexOf(media);
if (start < 0) throw new Error('Missing main mobile @media block');
const open = clean.indexOf('{', start + media.length);
let depth = 1, end = open + 1;
for (; end < clean.length && depth; end++) {
    if (clean[end] === '{') depth++;
    if (clean[end] === '}') depth--;
}
const mobileBlock = clean.slice(open + 1, end - 1);
for (const selector of [
    '.col-right {', '.studio-audio-suite {', '.audio-category-nav {',
    '.now-playing-stage {', '.volume-slider-dock {', '.lyrics-drawer-modal {'
]) {
    if (!mobileBlock.includes(selector)) throw new Error(selector + ' leaked outside the mobile breakpoint');
}
if (!clean.slice(end).includes('@media (max-width: 360px)')) {
    throw new Error('Compact smartphone media query was swallowed by the mobile block');
}
if (!source.includes('grid-template-columns: 82px minmax(0, 1fr)')) {
    throw new Error('Mobile metadata column lacks minmax(0, 1fr) shrink guard');
}
if (!source.includes('min-width: 0;\n        width: 100%;\n        max-width: none;')) {
    throw new Error('Volume slider shrink guard is missing');
}
console.log('PASS: CSS braces balanced; mobile selectors scoped; player/volume shrink guards intact.');
