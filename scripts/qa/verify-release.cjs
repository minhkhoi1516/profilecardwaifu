// Compare public release bytes with a specific committed tree, on both domains.
// Vercel deployment metadata must be checked separately for the Git SHA.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const commit=process.env.EXPECTED_COMMIT||execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const blob=file=>execFileSync('git',['show',commit+':'+file]);
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const html=blob('index.html'),assets=[...html.toString().matchAll(/(?:src|href)="((?:css|js)\/[^" ]+)"/g)].map(m=>m[1]);
const report={checkedAt:new Date().toISOString(),expectedCommit:commit,domains:[]};
(async()=>{
 for(const base of ['https://pro5-waifu-minkoi.vercel.app/','https://pro5waifu-minkoi.duckdns.org/']){
  const entries=[];
  for(const urlPath of ['',...assets]){
   const response=await fetch(new URL(urlPath,base),{headers:{'Cache-Control':'no-cache'}}),bytes=Buffer.from(await response.arrayBuffer());
   const expected=blob(urlPath?urlPath.split('?')[0]:'index.html');
   const entry={path:urlPath||'/',status:response.status,sha256:hash(bytes),matchesCommit:hash(bytes)===hash(expected),cacheControl:response.headers.get('cache-control'),age:response.headers.get('age')};entries.push(entry);
   if(response.status!==200||!entry.matchesCommit)throw Error('Release mismatch '+base+urlPath+' '+JSON.stringify(entry));
  }
  const range=await fetch(new URL('music/alya_01_Kawaikute_Gomen.mp3',base),{headers:{Range:'bytes=0-1023'}}),bytes=(await range.arrayBuffer()).byteLength;
  const rangeResult={status:range.status,bytes,contentRange:range.headers.get('content-range'),cacheControl:range.headers.get('cache-control')};
  if(range.status!==206||bytes!==1024||!rangeResult.contentRange?.startsWith('bytes 0-1023/'))throw Error('Broken media range '+base);
  report.domains.push({base,assets:entries,range:rangeResult});
 }
 const out=path.resolve(process.env.RELEASE_REPORT||'test-results/release-verification.json');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2));
 console.log(`PASS: ${report.domains.length} domains match ${commit}; ${assets.length} CSS/JS assets each; MP3 ranges return 206/1024 bytes.`);
})().catch(error=>{console.error(error);process.exitCode=1;});
