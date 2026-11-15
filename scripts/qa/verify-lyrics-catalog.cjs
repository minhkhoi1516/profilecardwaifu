'use strict';
// MinKoi Lyrics V4 — metadata/timestamp integrity only; not audio alignment QA.
const fs=require('node:fs'), path=require('node:path');
const root=path.resolve(__dirname,'../..'),win={};
new Function('window',fs.readFileSync(path.join(root,'js/config.js'),'utf8'))(win);
new Function('window',fs.readFileSync(path.join(root,'js/lyrics/repository.js'),'utf8'))(win);
const tracks=win.CONFIG.music.playlist,entries=win.MinkoiLyrics.Repository.getAllEntries();
const ids=new Set(),byId=new Map(entries.map(e=>[e.trackId,e]));
const summary={line:0,instrumental:0,unavailable:0},errors=[],warnings=[];
if(tracks.length!==31||entries.length!==31)errors.push('Catalogue should have 31 tracks');
for(const t of tracks){
 if(ids.has(t.id))errors.push('Repeated track ID '+t.id);
 ids.add(t.id);
 if(!fs.existsSync(path.join(root,t.file)))errors.push('Missing MP3 '+t.file);
 const e=byId.get(t.id);
 if(!e){errors.push('Missing lyrics record '+t.id);continue}
 if((t.spotifyTrackId||null)!==(e.spotifyTrackId||null))errors.push('Spotify ID inconsistent #'+t.id);
 const lines=e.lines||[];
 if(t.version==='instrumental'){
   summary.instrumental++;
   if(!e.isInstrumental||lines.length||e.syncLevel!=='instrumental')errors.push('Instrumental metadata wrong #'+t.id);
 }else if(lines.length){
   summary.line++;
   if(e.syncLevel!=='line')errors.push('Bad sync level #'+t.id);
   let prev=-1;
   for(const l of lines){
     const second=Number(l.time);
     if(!Number.isFinite(second)||second<prev||second*1000>t.durationMs+2500)errors.push('Invalid timing #'+t.id);
     prev=second;
   }
   if(lines[0].time===0)warnings.push('First timestamp at zero: #'+t.id);
   if(t.durationMs/1000-prev>25)warnings.push('Possible incomplete ending #'+t.id);
 }else{
   summary.unavailable++;
   if(e.syncLevel!=='unavailable')errors.push('Empty text not marked unavailable #'+t.id);
 }
}
if(byId.get(13)?.spotifyTrackId!=='0HI4lUmOWpFzxPB5NMlAXW')errors.push('Wrong Spotify Manazashi ID');
if(byId.get(15)?.spotifyTrackId!=='0OZlguQeZGqf56prXBmKEM')errors.push('Wrong Spotify Rintaro ID');
if(errors.length)throw Error(errors.join('; '));
console.log('PASS: '+tracks.length+' files; '+summary.line+' line-timed, '+summary.instrumental+' instrumental, '+summary.unavailable+' lacking lyrics.');
console.log('WARNING: '+warnings.length+' audio-review markers; timestamps are NOT verified to MP3.');
