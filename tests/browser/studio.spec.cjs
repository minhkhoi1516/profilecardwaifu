const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path');
const panels=[['sleep-timer-btn','sleep-timer-menu'],['audio-fx-btn','audio-fx-menu'],['playlist-toggle-btn','playlist-menu'],['lyrics-toggle-btn','lyrics-modal']];
const viewports=[[1440,900],[1280,720],[1920,1080],[1024,768],[390,844],[320,720],[360,800],[375,812],[430,932]];
async function ready(page){
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.persona-chip:not(.persona-chip-placeholder)')).toHaveCount(8);
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
 await expect(page.locator('#track-name')).not.toHaveText('');
 await page.waitForTimeout(450);
}
async function fits(page,selector){
 const el=page.locator(selector);await expect(el).toBeVisible();
 const result=await el.evaluate(e=>{
  const r=e.getBoundingClientRect(),s=getComputedStyle(e);
  const x=Math.max(0,Math.min(innerWidth-1,r.x+r.width/2)),y=Math.max(0,Math.min(innerHeight-1,r.y+Math.min(30,r.height/2)));
  const hit=document.elementFromPoint(x,y);
  return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,vw:innerWidth,vh:innerHeight,opacity:+s.opacity,hit:!!hit&&(e===hit||e.contains(hit)),text:e.textContent.trim().length};
 });
 expect(result.left,JSON.stringify(result)).toBeGreaterThanOrEqual(-1);
 expect(result.right,JSON.stringify(result)).toBeLessThanOrEqual(result.vw+1);
 expect(result.top,JSON.stringify(result)).toBeGreaterThanOrEqual(-1);
 expect(result.bottom,JSON.stringify(result)).toBeLessThanOrEqual(result.vh+1);
 expect(result.opacity).toBeGreaterThan(.95);expect(result.hit).toBe(true);expect(result.text).toBeGreaterThan(5);
 return result;
}
test.beforeEach(async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('console',msg=>{if(msg.type()==='error')errors.push('console: '+msg.text());});
 page.__errors=errors;
});
test.afterEach(async({page})=>expect(page.__errors).toEqual([]));
for(const [width,height]of viewports){
 test(`${width}x${height}: layout and four visible tools`,async({browser},info)=>{
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,isMobile:width<=860,hasTouch:width<=860,colorScheme:'dark',baseURL:process.env.BASE_URL||'http://127.0.0.1:8080'});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',msg=>{if(msg.type()==='error')errors.push('console: '+msg.text());});
  try{
   await ready(page);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   // Descendant geometry catches overflow hidden by the card, not only document overflow.
   for(const selector of ['.creator-tagline','.now-playing-stage','#play-pause','.volume-slider-dock','.audio-category-nav']){
    const b=await page.locator(selector).boundingBox();expect(b.x).toBeGreaterThanOrEqual(0);expect(b.x+b.width).toBeLessThanOrEqual(width+1);
   }
   await page.screenshot({path:info.outputPath(`layout-${width}.png`),fullPage:true});
   for(const [trigger,id]of panels){
    await page.locator('#'+trigger).click();
    await expect(page.locator('#'+id)).toHaveAttribute('data-panel-state','open');
    await fits(page,'#'+id);
    if(id==='playlist-menu'&&width<=860)expect(await page.evaluate(()=>document.activeElement.tagName)).not.toBe('INPUT');
    if(width===390||width===1440)await page.screenshot({path:info.outputPath(`${id}.png`)});
    await page.keyboard.press('Escape');await expect(page.locator('#'+id)).toHaveAttribute('data-panel-state','closed');
    expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');
   }
   expect(errors).toEqual([]);
  }finally{await context.close();}
 });
}
test('panel reversal, fast switching, focus restoration and outside dismissal',async({page})=>{
 await page.setViewportSize({width:390,height:844});await ready(page);
 for(const [trigger,id]of panels){
  for(let i=0;i<3;i++){
   await page.locator('#'+trigger).click();await page.waitForTimeout(30);
   await page.keyboard.press('Escape');await page.waitForTimeout(30);
   await page.locator('#'+trigger).click();
   await expect(page.locator('#'+id)).toHaveAttribute('data-panel-state','open');await fits(page,'#'+id);
   await page.keyboard.press('Escape');await expect(page.locator('#'+id)).toHaveAttribute('data-panel-state','closed');
   await expect(page.locator('#'+trigger)).toBeFocused();
  }
 }
 // Programmatic clicks exercise the coordinator while the sheet covers sibling triggers.
 for(const [trigger,id]of panels){await page.locator('#'+trigger).evaluate(e=>e.click());await page.waitForTimeout(40);}
 await expect(page.locator('#lyrics-modal')).toHaveAttribute('data-panel-state','open');
 expect(await page.locator('[data-panel-state="open"]').count()).toBe(1);
 await page.locator('#mobile-flyout-backdrop').click({position:{x:10,y:10}});
 await expect(page.locator('#lyrics-modal')).toHaveAttribute('data-panel-state','closed');
 await expect(page.locator('#mobile-flyout-backdrop')).not.toHaveClass(/active/);
});
test('open panels survive crossing breakpoints and keyboard-sized viewport',async({page})=>{
 await ready(page);
 for(const [trigger,id]of panels){
  await page.setViewportSize({width:1440,height:900});await page.locator('#'+trigger).click();
  await expect(page.locator('#'+id)).toHaveAttribute('data-panel-state','open');
  for(const size of [{width:390,height:844},{width:390,height:480},{width:1024,height:768}]){
   await page.setViewportSize(size);await page.waitForTimeout(300);await fits(page,'#'+id);
   if(size.width<860)await expect(page.locator('#mobile-flyout-backdrop')).toHaveClass(/active/);
  }
  await page.keyboard.press('Escape');await expect(page.locator('#'+id)).toHaveAttribute('data-panel-state','closed');
  expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');
 }
});
test('sheet short swipe returns visibly; long swipe dismisses cleanly',async({page})=>{
 await page.setViewportSize({width:390,height:844});await ready(page);
 for(const [trigger,id]of panels){
  await page.locator('#'+trigger).click();await expect(page.locator('#'+id)).toHaveAttribute('data-panel-state','open');
  const handle=page.locator('#'+id+' .sheet-drag-handle, #'+id+' .menu-header, #'+id+' .playlist-header, #'+id+' .lyrics-drawer-header').first();
  const b=await handle.boundingBox(),x=b.x+b.width/2,y=b.y+b.height/2;
  await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x,y+35,{steps:5});await page.waitForTimeout(200);await page.mouse.up();await page.waitForTimeout(900);
  await fits(page,'#'+id);
  await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x,y+155,{steps:8});await page.mouse.up();
  await expect(page.locator('#'+id)).toHaveAttribute('data-panel-state','closed');
 }
});
test('playback, immediate volume, seek, speed and persona preservation',async({page})=>{
 await ready(page);await page.locator('#play-pause').click();
 await expect.poll(()=>page.locator('#audio-player').evaluate(a=>!a.paused&&a.currentTime>0)).toBe(true);
 await page.locator('#volume-control').fill('63');
 expect(await page.locator('#audio-player').evaluate(a=>a.volume)).toBe(.63);
 await page.locator('#mute-btn').click();expect(await page.locator('#audio-player').evaluate(a=>a.volume)).toBe(0);
 await page.locator('#mute-btn').click();expect(await page.locator('#audio-player').evaluate(a=>a.volume)).toBe(.63);
 const original=await page.locator('#audio-player').evaluate(a=>a.currentSrc);
 for(let i=0;i<8;i++){
  await page.evaluate(n=>setPersona(n,false),i);await page.waitForTimeout(180);
  expect(await page.locator('#audio-player').evaluate(a=>a.currentSrc)).toBe(original);
  expect(await page.locator('#audio-player').evaluate(a=>a.paused)).toBe(false);
 }
 const seek=page.locator('#seek-container');await seek.focus();await page.keyboard.press('ArrowRight');
 await expect.poll(()=>page.locator('#audio-player').evaluate(a=>a.currentTime)).toBeGreaterThan(5);
 await page.locator('#playback-speed-btn').click();expect(await page.locator('#audio-player').evaluate(a=>a.playbackRate)).not.toBe(1);
 await page.locator('#play-pause').click();expect(await page.locator('#audio-player').evaluate(a=>a.paused)).toBe(true);
});
test('Zen mobile dock, exit focus, light theme, reduced motion and more menu',async({page})=>{
 await page.setViewportSize({width:320,height:720});await ready(page);
 await page.locator('#zen-mode-toggle').click();await page.waitForTimeout(600);
 await page.evaluate(()=>showToast('Kiểm tra vị trí thông báo'));
 const toast=await page.locator('#toast-region').boundingBox(),dock=await page.locator('#zen-mini-dock').boundingBox();
 expect(toast.y+toast.height).toBeLessThan(dock.y);
 await fits(page,'#zen-mini-dock');await page.locator('#zen-exit-btn').click();
 await expect(page.locator('#zen-mode-toggle')).toBeFocused();
 await page.locator('#theme-toggle').click();await expect(page.locator('body')).toHaveClass(/light-mode/);
 await page.locator('#top-more-btn').click();await expect(page.locator('#top-more-dropdown')).toHaveAttribute('data-popup-state','open');await fits(page,'#top-more-dropdown');
 await page.keyboard.press('Escape');await expect(page.locator('#top-more-btn')).toBeFocused();
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const [trigger,id]of panels){await page.locator('#'+trigger).click();await fits(page,'#'+id);await page.keyboard.press('Escape');}
});
test('Android desktop-site emulation does not autofocus playlist',async({browser})=>{
 const context=await browser.newContext({viewport:{width:980,height:800},isMobile:false,hasTouch:true,baseURL:process.env.BASE_URL||'http://127.0.0.1:8080'});
 const page=await context.newPage();try{await ready(page);await page.locator('#playlist-toggle-btn').click();await expect(page.locator('#playlist-menu')).toHaveAttribute('data-panel-state','open');await fits(page,'#playlist-menu');expect(await page.evaluate(()=>document.activeElement.tagName)).not.toBe('INPUT');}finally{await context.close();}
});
test('existing lyrics engine regression',async({page})=>{
 await page.goto('/tests/lyrics-v2.test.html');await page.waitForFunction(()=>window.__TEST_RESULTS__);
 const result=await page.evaluate(()=>window.__TEST_RESULTS__);expect(result.failed,JSON.stringify(result)).toBe(0);expect(result.passed).toBeGreaterThan(0);
});
test('all persona artwork preserves transparent edges within the card',async({page})=>{
 const sharp=require('sharp');await page.setViewportSize({width:390,height:844});await ready(page);
 for(let i=0;i<8;i++){
  await page.evaluate(n=>setPersona(n,false),i);
  await page.locator('#char-avatar').evaluate(async image=>{await image.decode();});
  const asset=await page.locator('#char-avatar').getAttribute('src');
  const {data,info}=await sharp(path.resolve(asset)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let minX=info.width,minY=info.height,maxX=0,maxY=0,transparent=0;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
   const a=data[(y*info.width+x)*4+3];if(a<10)transparent++;if(a>16){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}
  }
  expect(transparent/(info.width*info.height)).toBeGreaterThan(.05);
  for(const selector of ['#char-avatar','#player-album-art']){
   const box=await page.locator(selector).boundingBox(),card=await page.locator('.card-container').boundingBox();
   const scale=Math.min(box.width/info.width,box.height/info.height),left=box.x+(box.width-info.width*scale)/2,top=box.y+(box.height-info.height*scale)/2;
   expect(left+minX*scale).toBeGreaterThanOrEqual(card.x+2);expect(left+maxX*scale).toBeLessThanOrEqual(card.x+card.width-2);
   expect(top+minY*scale).toBeGreaterThanOrEqual(card.y+2);expect(top+maxY*scale).toBeLessThanOrEqual(card.y+card.height-2);
  }
 }
});
test('all MP3 routes, EQ inputs and timer selection',async({page,request})=>{
 await ready(page);
 const tracks=await page.evaluate(()=>CONFIG.music.playlist);expect(tracks).toHaveLength(31);
 for(const track of tracks){const response=await request.head('/'+track.file);expect(response.status()).toBe(200);expect(response.headers()['content-type']).toContain('audio/mpeg');}
 await page.locator('#audio-fx-btn').click();await expect(page.locator('#audio-fx-menu')).toHaveAttribute('data-panel-state','open');
 const sliders=page.locator('.eq-slider');await expect(sliders).toHaveCount(5);
 for(const slider of await sliders.all())expect((await slider.boundingBox()).width).toBeGreaterThanOrEqual(44);
 await sliders.nth(2).fill('5');await expect(sliders.nth(2)).toHaveValue('5');
 await page.keyboard.press('Escape');await page.locator('#sleep-timer-btn').click();
 await page.locator('[data-sleep="15"]').click();await expect(page.locator('#sleep-timer-btn')).toHaveAttribute('title',/15/);
});
