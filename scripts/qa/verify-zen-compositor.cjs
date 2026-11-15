'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const feature=read('js/features.js'),fluid=read('js/fluid-bg.js'),
  stars=read('js/stars.js'),music=read('js/music.js'),
  avatar=read('js/avatar.js'),backgrounds=read('css/style-backgrounds.css'),
  cards=read('css/style-card.css'),tokens=read('css/tokens-v3.css'),
  html=read('index.html');
function check(ok,msg){if(!ok)throw Error(msg);}
check((html.match(/class="banner-layer/g)||[]).length===2,'Expected two banner buffers');
check(avatar.includes('const needed = 2;'),'Avatar code still creates excess banner layers');
check(avatar.includes('releaseInactiveBannerTextures'),'Stale wallpaper texture cleanup missing');
check(!avatar.includes('void standby.offsetWidth'),'Synchronous layout flush remains');
check(!backgrounds.includes('transform 7.5s'),'Long-running fullscreen texture animation remains');
check(backgrounds.includes('body.zen-mode .banner-stage::before {') &&
      !backgrounds.includes('body.zen-mode .banner-stage::before { display: none; }'),
      'Zen ambient lighting was accidentally removed');
check(tokens.includes('body.light-mode.zen-mode .banner-stage::after'),
      'Light Mode is overriding the intended Zen vignette');
check(backgrounds.includes('body.zen-mode .fluid-bg-canvas'),'Zen must hide WebGL layer');
check(!backgrounds.includes('body.zen-mode .starry-bg'),'Zen must preserve waifu signature particles layer');
check(cards.includes('visibility: hidden;'),'Zen underlying UI still composited');
for(const s of [feature,fluid,stars,music])check(s.includes('minkoi:zenchange'),'Missing Zen event coordination');

// Fluid WebGL must pause in Zen mode to conserve GPU bandwidth
{
 const start=fluid.indexOf('    function shouldPauseFluid() {'),end=fluid.indexOf('    function render(now) {',start);
 check(start>=0&&end>start,'fluid pause guard unavailable');
 let zen=false;
 const doc={hidden:false,body:{classList:{contains:k=>k==='zen-mode'&&zen},getAttribute:()=>'high'}};
 const body=fluid.slice(start,end)+'\nreturn shouldPauseFluid;';
 const shouldPause=new Function('document','reducedMotionMQ','getQualityFactor',body)(doc,{matches:false},()=>1);
 check(shouldPause()===false,'fluid incorrectly stops outside Zen');
 zen=true;check(shouldPause()===true,'fluid does not stop in Zen');
 zen=false;doc.hidden=true;check(shouldPause()===true,'fluid does not stop while hidden');
}

// Stars waifu particles must CONTINUE in Zen mode for signature waifu atmosphere
{
 const start=stars.indexOf('    function shouldPauseParticles() {'),end=stars.indexOf('    function render(now) {',start);
 check(start>=0&&end>start,'stars pause guard unavailable');
 let zen=false;
 const doc={hidden:false,body:{classList:{contains:k=>k==='zen-mode'&&zen},getAttribute:()=>'high'}};
 const body=stars.slice(start,end)+'\nreturn shouldPauseParticles;';
 const shouldPause=new Function('document','reducedMotionMQ','getQualityFactor',body)(doc,{matches:false},()=>1);
 check(shouldPause()===false,'stars incorrectly stops outside Zen');
 zen=true;check(shouldPause()===false,'stars must NOT stop in Zen mode');
 zen=false;doc.hidden=true;check(shouldPause()===true,'stars does not stop while hidden');
}
console.log('PASS Zen: two buffers, active waifu particles, paused WebGL fluid, hidden UI.');
