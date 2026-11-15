// Generates candidates only. Read docs/PREVIEW_QA.md before promoting them.
const {chromium}=require('@playwright/test'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const out=path.resolve(process.env.PREVIEW_DIR||'test-results/previews');fs.mkdirSync(out,{recursive:true});
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const browser=await chromium.launch(process.env.QA_CHANNEL?{channel:process.env.QA_CHANNEL}:{});
 const manifest={generatedAt:new Date().toISOString(),commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),dirty:!!execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim(),source:process.env.BASE_URL||'http://127.0.0.1:8080',images:[]};
 try{for(const [name,width,height,mobile]of [['desktop',1440,900,false],['mobile',390,844,true]]){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,isMobile:mobile,hasTouch:mobile,colorScheme:'dark'}),page=await context.newPage();
  await page.goto(manifest.source,{waitUntil:'domcontentloaded'});
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  await page.waitForTimeout(1400);await page.mouse.move(0,0);await page.evaluate(()=>scrollTo(0,0));
  const state=await page.evaluate(()=>({release:document.querySelector('meta[name="minkoi-release"]')?.content,width:innerWidth,height:innerHeight,dpr:devicePixelRatio,zoom:getComputedStyle(document.body).zoom,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,
   openPanels:document.querySelectorAll('[data-panel-state="open"],[data-popup-state="open"]').length,
   required:[...document.querySelectorAll('.site-brand-header,.card-container,#char-avatar,.suite-title,#track-name,#play-pause,.audio-category-nav,.volume-slider-dock')].map(e=>({id:e.id||e.className,text:e.textContent.trim(),rect:e.getBoundingClientRect().toJSON()})),
   assets:[...document.querySelectorAll('link[rel="stylesheet"],script[src]')].map(e=>e.getAttribute('href')||e.getAttribute('src'))}));
  if(state.scrollWidth>width||state.openPanels||state.dpr!==1)throw Error('Invalid capture state '+name);
  for(const e of state.required)if(e.rect.left<0||e.rect.right>width+1||e.rect.top<0||e.rect.bottom>(mobile?state.scrollHeight:height))throw Error('Clipped required element '+name+' '+e.id);
  const file=name+'-preview.png';await page.screenshot({path:path.join(out,file),fullPage:mobile});
  // Keep a viewport capture for comparison with the complete mobile page.
  if(mobile)await page.screenshot({path:path.join(out,'mobile-viewport.png')});
  manifest.images.push({file,sha256:sha(fs.readFileSync(path.join(out,file))),viewport:{width,height},fullPage:mobile,state});
  if(!manifest.sourceFiles){
   const names=['index.html',...state.assets.filter(url=>/^(css|js)\//.test(url)).map(url=>url.split('?')[0])];
   manifest.sourceFiles=names.map(file=>({file,sha256:sha(fs.readFileSync(path.resolve(file),'utf8').replace(/\r\n/g,'\n'))}));
  }
  await context.close();
 }}finally{await browser.close();fs.writeFileSync(path.join(out,'capture.json'),JSON.stringify(manifest,null,2));}
 console.log('Candidates generated at '+out+'; NOT visually approved.');
})().catch(e=>{console.error(e);process.exitCode=1;});
