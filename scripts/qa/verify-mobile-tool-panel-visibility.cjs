'use strict';
// Regression: all Miuix mobile tool panels must retain an explicit zero
// translation when fully open, overriding CSS closed-state translateY(100%).
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'js/ui/components.js'), 'utf8');
const responsive = fs.readFileSync(path.join(root, 'css/style-responsive.css'), 'utf8');
const music = fs.readFileSync(path.join(root, 'js/music.js'), 'utf8');
const lyrics = fs.readFileSync(path.join(root, 'js/lyrics/index.js'), 'utf8');
function check(v, message) {if (!v) throw new Error(message);}
check(/\.dropdown-flyout,[\s\S]*?transform:\s*translateY\(100%\);/.test(responsive),
    'Test requires the existing closed bottom-sheet CSS fallback');
check(/\.lyrics-drawer-modal[\s\S]*?transform:\s*translateY\(100%\);/.test(responsive),
    'Test requires the existing closed mobile lyrics fallback');
const start = source.indexOf('        const applyFraction = (f) => {', source.indexOf('    function createMiuixPanelOverlay('));
const end = source.indexOf('        const fractionSpring =', start);
check(start > 0 && end > start, 'Missing Miuix tool panel motion renderer');
const make = new Function('global','doc','panelEl','mobileBackdrop','isCenterModal','originX','originY',
    source.slice(start,end) + '\nreturn applyFraction;');
function simulate(viewportWidth, centered) {
    const panelEl={style:{}}, mobileBackdrop={style:{}};
    const apply=make({innerWidth:viewportWidth},{documentElement:{clientWidth:viewportWidth}},
        panelEl,mobileBackdrop,centered,'50%','100%');
    return {apply,panel:panelEl.style,backdrop:mobileBackdrop.style};
}
for (const width of [320,390,430,720]) {
    const sheet=simulate(width,false);
    sheet.apply(0);
    check(sheet.panel.transform==='translateY(100.00%)',
        width+': closed tool sheet must be offscreen');
    sheet.apply(0.5);
    check(sheet.panel.transform==='translateY(50.00%)',
        width+': half-open sheet must track its spring');
    sheet.apply(1);
    check(sheet.panel.transform==='translateY(0.00%)',
        width+': open tool sheet must OVERRIDE the CSS 100% fallback');
    check(sheet.panel.opacity==='1.000',
        width+': open tool sheet must be opaque enough to see');
    check(Number(sheet.backdrop.opacity)>0,
        width+': backdrop must remain visible with the sheet, not alone');
    const lyricsSheet=simulate(width,true);
    lyricsSheet.apply(1);
    check(lyricsSheet.panel.transform==='translateY(0.00%)',
        width+': centered lyrics controller uses bottom-sheet rendering on mobile');
}
const desktop=simulate(1440,false);
desktop.apply(1);
check(desktop.panel.transform==='scale(1.0000)',
    'Desktop popup motion must remain unchanged');
const desktopLyrics=simulate(1440,true);
desktopLyrics.apply(1);
check(desktopLyrics.panel.transform==='translate(-50%, -50%) scale(1.0000)',
    'Desktop lyrics center transform must remain unchanged');
for(const marker of ['sleep-timer-menu','audio-fx-menu','playlist-menu']){
    check(music.includes("id: '"+marker+"'"),
        marker+' must still use the shared Miuix panel motion');
}
check(lyrics.includes("id: 'lyrics'"), 'Lyrics must still use shared Miuix panel motion');
console.log('PASS: 4 mobile widths, all three tool panels + Lyrics, closed/drag/open states, desktop overlays');
