// Browser-lab measurements. No physical-device or guaranteed-FPS claims.
const {chromium}=require('@playwright/test'),fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const baseline=process.argv.includes('--baseline'),playing=process.argv.includes('--playing'),out=path.resolve(process.env.PROFILE_DIR||'scratch/performance');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch(process.env.QA_CHANNEL?{channel:process.env.QA_CHANNEL}:{}),results=[];
 try{for(const mode of ['high','balanced','eco']){
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true}),page=await context.newPage();
  if(baseline){
   const names=execFileSync('git',['ls-tree','-r','--name-only','50382d7'],{encoding:'utf8'}).split('\n').filter(f=>f==='index.html'||/^(js|css)\/.+\.(js|css)$/.test(f));
   const files=new Map(names.map(f=>[f,execFileSync('git',['show','50382d7:'+f])]));
   await page.route('**/*',route=>{
    const name=new URL(route.request().url()).pathname.slice(1)||'index.html';
    const body=files.get(name);if(body)return route.fulfill({body,contentType:name.endsWith('.css')?'text/css':name.endsWith('.js')?'text/javascript':'text/html'});return route.continue();
   });
  }
  await page.addInitScript(()=>{
   window.__longTasks=[];
   new PerformanceObserver(list=>__longTasks.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({entryTypes:['longtask']});
  });
  await page.goto(process.env.BASE_URL||'http://127.0.0.1:8080/',{waitUntil:'load'});
  await page.evaluate(m=>setMinkoiQuality(m,false),mode);await page.waitForTimeout(1800);
  if(playing){await page.locator('#play-pause').click();await page.waitForFunction(()=>document.querySelector('#audio-player').currentTime>0);await page.waitForTimeout(500);}
  const cdp=await context.newCDPSession(page);await cdp.send('Performance.enable');
  await cdp.send('Tracing.start',{categories:'devtools.timeline,cc',transferMode:'ReturnAsStream'});
  const before=(await cdp.send('Performance.getMetrics')).metrics;
  const start=await page.evaluate(()=>performance.now());
  const frames=await page.evaluate(()=>new Promise(resolve=>{
   const values=[],start=performance.now();let previous=start;
   function tick(now){values.push(now-previous);previous=now;if(now-start>=5000)resolve(values);else requestAnimationFrame(tick);}requestAnimationFrame(tick);
  }));
  const after=(await cdp.send('Performance.getMetrics')).metrics;
  const completed=new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve));await cdp.send('Tracing.end');
  const {stream}=await completed;let trace='';
  for(;;){const chunk=await cdp.send('IO.read',{handle:stream});trace+=chunk.data;if(chunk.eof)break;}await cdp.send('IO.close',{handle:stream});
  const timeline={};for(const event of JSON.parse(trace).traceEvents){if(event.ph==='X'&&['Paint','RasterTask','Layout','UpdateLayoutTree','Layerize','CompositeLayers'].includes(event.name)){const entry=timeline[event.name]||(timeline[event.name]={count:0,cpuMs:0});entry.count++;entry.cpuMs+=(event.dur||0)/1000;}}
  const delta={};for(const name of ['TaskDuration','ScriptDuration','LayoutDuration','RecalcStyleDuration','LayoutCount','RecalcStyleCount'])delta[name]=after.find(m=>m.name===name).value-before.find(m=>m.name===name).value;
  const sorted=frames.slice(1).sort((a,b)=>a-b),quantile=p=>sorted[Math.floor((sorted.length-1)*p)];
  const state=await page.evaluate(start=>{
   const gl=document.querySelector('#fluid-bg-canvas').getContext('webgl'),ext=gl?.getExtension('WEBGL_debug_renderer_info');
   return {longTasks:__longTasks.filter(e=>e.start>=start),heap:performance.memory?.usedJSHeapSize,images:performance.getEntriesByType('resource').filter(e=>/\/assets\//.test(e.name)).map(e=>({name:new URL(e.name).pathname,bytes:e.transferSize,duration:e.duration})),webgl:!!gl,gpu:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):null,userAgent:navigator.userAgent};
  },start);
  results.push({mode,baseline,playing,windowMs:5000,frames:frames.length,medianMs:quantile(.5),p95Ms:quantile(.95),p99Ms:quantile(.99),intervalsOver25ms:sorted.filter(x=>x>25).length,delta,timeline,...state});
  await context.close();
 }}finally{await browser.close();}
 const file=path.join(out,(baseline?'baseline':'release')+(playing?'-playing':'')+'.json');fs.writeFileSync(file,JSON.stringify({environment:'Windows headless Chromium/Edge; mobile emulation; no CPU throttling; 5-second sample; host load affects results; timeline sums are CPU time across threads, not GPU time',results},null,2));
 console.log(file);for(const r of results)console.log(JSON.stringify({mode:r.mode,median:r.medianMs,p95:r.p95Ms,longTasks:r.longTasks.length,taskSeconds:r.delta.TaskDuration,heap:r.heap,imageRequests:r.images.length}));
})().catch(e=>{console.error(e);process.exitCode=1;});
