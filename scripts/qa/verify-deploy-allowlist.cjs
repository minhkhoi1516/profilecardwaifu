'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const text=fs.readFileSync(path.join(root,'.vercelignore'),'utf8');
const rules=text.split(/\r?\n/).map(s=>s.trim()).filter(s=>s&&!s.startsWith('#'));
if(rules[0]!=='/*')throw Error('Production must use a root-level allowlist');
const allowed=new Set(rules.slice(1));
for(const item of ['index.html','favicon.ico','manifest.webmanifest','vercel.json','css','js','assets','music']){
 if(!allowed.has('!'+item))throw Error('Required runtime path not allowed: '+item);
 if(!fs.existsSync(path.join(root,item)))throw Error('Missing runtime path: '+item);
}
for(const unnecessary of ['docs','tests','scripts','tools','.github','README.md','playwright.config.cjs','package.json']){
 if(allowed.has('!'+unnecessary))throw Error('Development files accidentally allowed: '+unnecessary);
}
console.log('PASS: Vercel allowlist ships runtime files only, preserves development evidence on GitHub.');
