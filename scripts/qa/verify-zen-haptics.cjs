'use strict';
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const components=read('js/ui/components.js'), background=read('css/style-backgrounds.css'),
  tokens=read('css/tokens-v3.css'), html=read('index.html');
function check(b,s){ if(!b)throw Error(s); }
check(html.includes('id="haptic-feedback-toggle"'), 'Missing user-accessible haptic switch');
check(tokens.includes('.haptic-feedback-state'), 'Missing menu setting styles');
check(background.includes('@keyframes zenCinematicDrift'), 'High Zen cinematic drift missing');
check(background.includes('@keyframes zenLightBreathing'), 'Zen light-breathing missing');
check(background.includes('(prefers-reduced-motion: no-preference)'), 'Reduced-motion gate missing');
check(background.includes('data-quality="balanced"'), 'Balanced motion fallback missing');
check(!background.includes('transform 7.5s'), 'Heavy old fullscreen transform reintroduced');
const start=components.indexOf('    function initPressFeedback() {');
const end=components.indexOf('    // ----------------------------------------------------------------------\n    // 4. MIUIX TOP-RIGHT LISTPOPUP',start);
check(start>=0&&end>start,'Miuix press controller missing');
const events=new Map(),buzz=[],attrs={};
const toggle={
  disabled:false, listeners:new Map(),
  setAttribute(k,v){attrs[k]=v;},
  addEventListener(k,fn){this.listeners.set(k,fn);},
};
const state={textContent:''};
const doc={
 getElementById(id){return id==='haptic-feedback-toggle'?toggle:id==='haptic-feedback-state'?state:null;},
 addEventListener(k,fn){events.set(k,fn);}
};
let current=0;
const storage=new Map();
const global={
 navigator:{vibrate(ms){buzz.push(ms);return true;}},
 localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},
 performance:{now(){return current+=150}},
 addEventListener(k,fn){events.set(k,fn)}
};
const Spring=()=>({PRESETS:{HERO_BUTTON:{},TACTILE_PRESS:{},SINK:{}},
 createSpring(){return {setTarget(){}}}});
const init=new Function('doc','global','Spring',components.slice(start,end)+'\nreturn initPressFeedback;')(doc,global,Spring);
init();
check(attrs['aria-checked']==='true'&&state.textContent==='Bật','Haptics must default on when supported');
const button={id:'zen-play-pause',disabled:false,style:{},classList:{contains:()=>false},contains(x){return x===this}};
const pointer=(type,x,y='10',kind='touch')=>({type,pointerId:1,pointerType:kind,button:0,target:button,clientX:x,clientY:Number(y)});
button.closest=()=>button;
events.get('pointerdown')(pointer('pointerdown',10));
events.get('pointerup')(pointer('pointerup',10));
check(buzz.length===1,'A real mobile tap must vibrate once');
events.get('pointerdown')(pointer('pointerdown',10));
events.get('pointermove')(pointer('pointermove',70));
events.get('pointerup')(pointer('pointerup',70));
check(buzz.length===1,'Dragging must never vibrate');
events.get('pointerdown')(pointer('pointerdown',10,'10','mouse'));
events.get('pointerup')(pointer('pointerup',10,'10','mouse'));
check(buzz.length===1,'Mouse must not vibrate');
toggle.listeners.get('click')();
check(attrs['aria-checked']==='false'&&state.textContent==='Tắt','Haptics toggle must disable');
events.get('pointerdown')(pointer('pointerdown',10));
events.get('pointerup')(pointer('pointerup',10));
check(buzz.length===1,'Disabled haptics should not vibrate');
console.log('PASS: Zen tiered motion and reduced-motion gate; optional haptics tap, drag, mouse, toggle.');
