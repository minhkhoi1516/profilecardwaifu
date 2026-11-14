'use strict';
// Protect MinKoi popovers against the short-viewport clipping seen on laptop
// screens and preserve mobile bottom sheets. No production dependencies.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const music = fs.readFileSync(path.join(root, 'js/music.js'), 'utf8');
const card = fs.readFileSync(path.join(root, 'css/style-card.css'), 'utf8');
const right = fs.readFileSync(path.join(root, 'css/style-right.css'), 'utf8');
const responsive = fs.readFileSync(path.join(root, 'css/style-responsive.css'), 'utf8');

function check(value, message) {
    if (!value) throw new Error(message);
}
const start = music.indexOf('    function positionDesktopFlyout(');
const end = music.indexOf('    function openFlyout(', start);
check(start >= 0 && end > start, 'Desktop flyout placement function is missing');
const win = { innerWidth: 1366, innerHeight: 768, visualViewport: { height: 768 } };
const place = new Function('window',
    music.slice(start, end) + '\nreturn positionDesktopFlyout;')(win);

function simulate(top, bottom, contentHeight) {
    const classes = new Set();
    const menu = {
        scrollHeight: contentHeight,
        style: {},
        classList: {
            add: x => classes.add(x),
            remove: x => classes.delete(x),
            contains: x => classes.has(x),
            toggle: (x, yes) => yes ? classes.add(x) : classes.delete(x)
        },
        getBoundingClientRect() { return { height: contentHeight }; }
    };
    place(menu, { getBoundingClientRect: () => ({ top, bottom }) });
    return { flipped: classes.has('is-flipped'), height: Number(menu.style.maxHeight.slice(0, -2)), raw: menu.style.maxHeight };
}
const low = simulate(460, 504, 420);
check(low.flipped, 'Flyout near the bottom must open upward');
check(low.height > 0 && low.height <= 460 - 70, 'Flipped flyout exceeds its safe upper space');

check(music.includes("suite?.querySelector('.suite-header-row')"), 'Missing safe-header anchor for desktop tools');
check(right.includes('box-sizing: border-box;'), 'Flyouts must use border-box sizing');
const header = { getBoundingClientRect: () => ({ bottom: 92 }) };
const suite = { querySelector: selector => selector === '.suite-header-row' ? header : null };
const placeWithHeader = new Function('window',
    music.slice(start, end) + '\nreturn positionDesktopFlyout;')(win);
const popup = {scrollHeight: 300,style:{},classList:{add(){},remove(){},contains(){return false},toggle(x,v){this.flipped=v}},getBoundingClientRect(){return {height:300}}};
const triggerWithHeader = {getBoundingClientRect(){return {top:318,bottom:360}},closest(sel){return sel === '.studio-audio-suite' ? suite : null}};
win.visualViewport.height=380; win.innerHeight=380;
placeWithHeader(popup, triggerWithHeader);
check(popup.classList.flipped, 'Short desktop window should flip timer upward');
check(parseInt(popup.style.maxHeight,10) <= 318-92-14-12, 'Timer popover must not cover Studio title');
check(popup.style.overflowY === 'auto', 'Short popover content must scroll internally');
win.visualViewport.height=768; win.innerHeight=768;

const high = simulate(105, 149, 320);
check(!high.flipped, 'Flyout with plenty of lower space should not flip');
check(high.height > 320, 'Flyout below trigger lacks sufficient room');

win.innerWidth = 390;
const mobile = simulate(440, 484, 420);
check(!mobile.flipped && mobile.raw === '', 'Desktop positioning must not override mobile bottom sheets');

check(right.includes('.track-actions-bar .dropdown-flyout.is-flipped'),
    'Missing CSS rule for upward-opening tool menus');
check(card.includes('height: min(520px, calc(100dvh - 112px))'),
    'Desktop lyrics panel must be bounded by viewport height');
check(card.includes('z-index: 1200;'),
    'Desktop lyrics overlay must appear above the brand header');
check(responsive.includes('.lyrics-drawer-modal.open'),
    'Mobile lyrics bottom-sheet rule must remain intact');

console.log('PASS: desktop flyout flips, small viewport bounds, mobile sheets unchanged, lyrics panel safe.');