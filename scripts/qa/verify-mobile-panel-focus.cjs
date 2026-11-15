'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const components = fs.readFileSync(path.join(root, 'js/ui/components.js'), 'utf8');
const music = fs.readFileSync(path.join(root, 'js/music.js'), 'utf8');
function assert(ok, msg) {if (!ok) throw new Error(msg)}
assert(components.includes("initialFocus: isMobile ? 'container' : id !== 'playlist-menu'"),
       'Mobile panels must focus their container rather than a search input');
assert(music.includes("window.matchMedia('(pointer: coarse)').matches"),
       'Desktop-site mode must detect touch input');
assert(!music.includes('input && window.innerWidth > 768'),
       'Legacy duplicate search auto-focus must be removed');
const start = components.indexOf('    function pushFocusTrap(');
const stop = components.indexOf('    // ----------------------------------------------------------------------\n    // 2. MUTUAL-EXCLUSION', start);
assert(start >= 0 && stop > start, 'Cannot extract focus trap implementation');
const handlers = new Map(), traps = [];
const doc = {activeElement:null, addEventListener(n,f){handlers.set(n,f)}, removeEventListener(n){handlers.delete(n)}};
let inputFocuses=0,panelFocuses=0;
const input={focus(){inputFocuses++; doc.activeElement=this}};
const panel={hasAttribute:()=>false,setAttribute(){},contains:e=>e===panel||e===input,
  focus(){panelFocuses++;doc.activeElement=this}};
const trigger={focus(){doc.activeElement=this}};
const createTrap=new Function('doc','activeTraps','getFocusableElements','isFocusableVisible',
    components.slice(start,stop)+'\nreturn pushFocusTrap')(
      doc,traps,()=>[input],()=>true);
const a=createTrap(panel,trigger,{initialFocus:'container'});
assert(panelFocuses===1 && inputFocuses===0,'Mobile opening focused text input');
a({restoreFocus:false});
const b=createTrap(panel,trigger,{initialFocus:true});
assert(inputFocuses===1,'Desktop initial focus behavior changed unexpectedly');
b({restoreFocus:false});
const gstart=music.indexOf('    function shouldAutoFocusPlaylistSearch()');
const gend=music.indexOf('    function initToolPanelControllers()',gstart);
assert(gstart>0 && gend>gstart,'Desktop auto-focus guard missing');
const makeGuard=new Function('window',music.slice(gstart,gend)+'\nreturn shouldAutoFocusPlaylistSearch');
assert(!makeGuard({innerWidth:390,navigator:{maxTouchPoints:5},matchMedia:()=>({matches:true})})(),'Mobile must not auto-focus');
assert(!makeGuard({innerWidth:980,navigator:{maxTouchPoints:5},matchMedia:()=>({matches:false})})(),'Android desktop-site must not auto-focus');
assert(makeGuard({innerWidth:1440,navigator:{maxTouchPoints:0},matchMedia:()=>({matches:false})})(),'PC with mouse may auto-focus');
console.log('PASS: mobile keyboard guard, Android desktop-site, focus trap, PC search behavior');