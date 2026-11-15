const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
test.use({trace:'off'});
async function ready(page){
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.persona-chip:not(.persona-chip-placeholder)')).toHaveCount(8);
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
 await expect(page.locator('#track-name')).not.toHaveText('');
 await page.evaluate(()=>{
  addEventListener('pointerdown',()=>{window.__qaPointerX=null;},{passive:true});
  addEventListener('pointermove',event=>{window.__qaPointerX=event.clientX;},{passive:true});
 });
 await page.waitForTimeout(450);
}
async function touch(page,type,x,y){
 const session=page.__cdp||(page.__cdp=await page.context().newCDPSession(page));
 await session.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'||type==='touchCancel'?[]:[{x,y,id:1}],});
 // CDP acknowledgement precedes DOM pointer delivery. Sample only after the
 // real event is delivered; input-delay telemetry records that waiting cost.
 if(type==='touchMove')await page.waitForFunction(value=>Math.abs(window.__qaPointerX-value)<.5,x,{timeout:5000});
}
test.describe('Touch navigation',()=>{
test('real touch: glass tracking, reversal, edge scroll, cancel, all quality modes',async({browser},info)=>{
 test.setTimeout(180000);
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1,baseURL:process.env.BASE_URL||'http://127.0.0.1:8080'});
 const page=await context.newPage();
 await page.addInitScript(()=>{
  window.__gestureTelemetry={inputDelayMs:[],longTasks:[]};
  for(const type of ['pointerdown','pointermove','pointerup'])addEventListener(type,e=>__gestureTelemetry.inputDelayMs.push(performance.now()-e.timeStamp),{passive:true});
  new PerformanceObserver(list=>__gestureTelemetry.longTasks.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({entryTypes:['longtask']});
 });
 await ready(page);
 const samples=[];
 try{
 for(const mode of ['high','balanced','eco']){
  await page.evaluate(m=>setMinkoiQuality(m,false),mode);
  for(let repeat=0;repeat<7;repeat++){
   await page.locator('.cat-tab[data-cat="all"]').evaluate(e=>e.click());await page.waitForTimeout(350);
   await page.locator('#audio-category-nav').scrollIntoViewIfNeeded();
   const nav=await page.locator('#audio-category-nav').boundingBox(),ind=page.locator('.liquid-glass-indicator');
   const initial=await ind.boundingBox(),x=initial.x+initial.width/2,y=nav.y+nav.height/2;
   await touch(page,'touchStart',x,y);
   const positions=[];
   for(const delta of [12,35,60,85,60,35]){
    await touch(page,'touchMove',x+delta,y);await page.waitForTimeout(35);
    const b=await ind.boundingBox();positions.push({finger:x+delta,left:b.x,width:b.width});
   }
   expect(positions[3].left-positions[0].left).toBeGreaterThan(45);
   expect(positions[3].left-positions[5].left).toBeGreaterThan(25);
   for(let n=1;n<positions.length;n++)expect(Math.abs((positions[n].left-positions[n-1].left)-(positions[n].finger-positions[n-1].finger)),JSON.stringify({mode,repeat,positions})).toBeLessThan(22);
   await touch(page,'touchEnd');await page.waitForTimeout(850);
   const active=await page.locator('.cat-tab.active').boundingBox(),settled=await ind.boundingBox();
   expect(Math.abs(active.x-settled.x)).toBeLessThan(2);expect(Math.abs(active.width-settled.width)).toBeLessThan(2);
   samples.push({mode,repeat,positions,settled});
   fs.writeFileSync(info.outputPath('glass-progress.json'),JSON.stringify(samples,null,2));
  }
 }
 await page.evaluate(()=>setMinkoiQuality('balanced',false));
 const nav=await page.locator('#audio-category-nav').boundingBox();
 const before=await page.locator('#audio-category-nav').evaluate(e=>e.scrollLeft);
 await touch(page,'touchStart',nav.x+80,nav.y+24);await touch(page,'touchMove',nav.x+nav.width-8,nav.y+24);await page.waitForTimeout(900);
 expect(await page.locator('#audio-category-nav').evaluate(e=>e.scrollLeft)).toBeGreaterThan(before+100);
 await touch(page,'touchCancel');await page.waitForTimeout(800);
 await expect(page.locator('#audio-category-nav')).not.toHaveClass(/is-liquid-dragging/);
 const selected=await page.locator('.cat-tab.active').getAttribute('data-cat');
 await touch(page,'touchStart',nav.x+90,nav.y+24);await touch(page,'touchMove',nav.x+92,nav.y-80);await touch(page,'touchEnd');
 expect(await page.locator('.cat-tab.active').getAttribute('data-cat')).toBe(selected);
 const telemetry=await page.evaluate(()=>__gestureTelemetry);
 fs.writeFileSync(info.outputPath('glass-samples.json'),JSON.stringify({samples,telemetry},null,2));
 }finally{await context.close();}
});
test('record a real touch drag and reversal',async({browser},info)=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1,baseURL:process.env.BASE_URL||'http://127.0.0.1:8080',recordVideo:{dir:info.outputPath('interaction'),size:{width:390,height:844}}});
 try{
  const page=await context.newPage();await ready(page);await page.locator('#audio-category-nav').scrollIntoViewIfNeeded();
  const nav=await page.locator('#audio-category-nav').boundingBox();
  await touch(page,'touchStart',nav.x+75,nav.y+24);
  for(const delta of [20,40,60,80,60,40,20]){await touch(page,'touchMove',nav.x+75+delta,nav.y+24);await page.waitForTimeout(70);}
  await touch(page,'touchEnd');await page.waitForTimeout(800);
  await expect(page.locator('#audio-category-nav')).not.toHaveClass(/is-liquid-dragging/);
 }finally{await context.close();}
});
});
