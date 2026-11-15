// Local static server with honest MIME types and byte ranges for media tests.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json'};
http.createServer((req,res)=>{
 let file;
 try { file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname)); }
 catch {res.writeHead(400).end();return;}
 if(file===root) file=path.join(root,'index.html');
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.stat(file,(err,stat)=>{
  if(err||!stat.isFile()){res.writeHead(404).end();return;}
  const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-cache'};
  let start=0,end=stat.size-1,status=200;
  if(req.headers.range){
   const match=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
   if(!match){res.writeHead(416).end();return;}
   start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),end):end;
   if(start>end){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`}).end();return;}
   status=206;headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`;
  }
  headers['Content-Length']=end-start+1;
  res.writeHead(status,headers);
  if(req.method==='HEAD')res.end();else fs.createReadStream(file,{start,end}).pipe(res);
 });
}).listen(Number(process.env.PORT||8080),'127.0.0.1');
