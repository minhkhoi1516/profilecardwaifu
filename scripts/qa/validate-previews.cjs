// Structural and pixel checks supplement, never replace, visual review.
const sharp=require('sharp'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const folder=path.resolve(process.argv[2]||'test-results/previews');
const manifest=JSON.parse(fs.readFileSync(path.join(folder,'capture.json'),'utf8'));
if(manifest.images?.length!==2||!['desktop-preview.png','mobile-preview.png'].every(name=>manifest.images.some(item=>item.file===name)))throw Error('Both complete preview candidates are required');
for(const source of manifest.sourceFiles||[]){
 const current=fs.readFileSync(path.resolve(source.file),'utf8').replace(/\r\n/g,'\n');
 if(crypto.createHash('sha256').update(current).digest('hex')!==source.sha256)throw Error('Source changed after capture: '+source.file);
}
(async()=>{for(const item of manifest.images){
 const file=path.join(folder,item.file),bytes=fs.readFileSync(file),meta=await sharp(bytes).metadata();
 if(crypto.createHash('sha256').update(bytes).digest('hex')!==item.sha256)throw Error('Capture hash changed');
 const expectedH=item.fullPage?item.state.scrollHeight:item.viewport.height;
 if(meta.width!==item.viewport.width||Math.abs(meta.height-expectedH)>1)throw Error('Wrong capture dimensions '+item.file);
 const {data,info}=await sharp(bytes).resize({width:240}).removeAlpha().raw().toBuffer({resolveWithObject:true});
 const channels=info.channels;
 // Detect accidental repeated half-page/half-width compositor tiles.
 for(const axis of ['x','y']){
  const size=axis==='x'?info.width:info.height;
  let minimum=Infinity;
  for(let offset=Math.floor(size/2)-3;offset<=Math.floor(size/2)+3;offset++){
   let sum=0,count=0;
   for(let y=0;y<info.height-(axis==='y'?offset:0);y+=2)for(let x=0;x<info.width-(axis==='x'?offset:0);x+=2)for(let c=0;c<channels;c++){
    const a=(y*info.width+x)*channels+c,b=((y+(axis==='y'?offset:0))*info.width+x+(axis==='x'?offset:0))*channels+c;
    sum+=Math.abs(data[a]-data[b]);count++;
   }
   minimum=Math.min(minimum,sum/count);
  }
  if(minimum<3)throw Error('Suspected repeated image tiles '+item.file+' '+axis);
 }
 const stats=await sharp(bytes).stats();if(stats.entropy<2)throw Error('Blank/low information capture');
 console.log(`PASS structural/pixel checks: ${item.file} ${meta.width}x${meta.height}; visual review still required.`);
}})().catch(e=>{console.error(e);process.exitCode=1;});
