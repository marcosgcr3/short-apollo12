
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const [,, directory, spec, width='1080'] = process.argv;
const root=path.resolve('web');
fs.mkdirSync(directory,{recursive:true});
const frames=spec.split(',').flatMap(part=>{
 if(!part.includes('-')) return [Number(part)];
 const [start,end]=part.split('-').map(Number);
 return Array.from({length:end-start+1},(_,i)=>i+start);
});
const srv=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 const file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404).end();return;}
 res.writeHead(200,{'Content-Type':file.endsWith('.js')?'text/javascript':file.endsWith('.png')?'image/png':file.endsWith('.jpg')?'image/jpeg':'text/html'});
 fs.createReadStream(file).pipe(res);
});
srv.listen(0,'127.0.0.1');
await new Promise(resolve=>srv.on('listening',resolve));
const browser=await chromium.launch({channel:'chrome',args:['--enable-gpu','--ignore-gpu-blocklist','--enable-unsafe-swiftshader',...(process.env.APOLLO_SOFTWARE?['--use-angle=swiftshader']:[])]});
try {
 const page=await browser.newPage({viewport:{width:Number(width),height:Math.round(Number(width)*16/9)}});
 page.on('console',m=>{if(!m.text().includes('favicon')) console.log(m.text());});
 page.on('pageerror',e=>console.log(e.stack));
 await page.goto('http://127.0.0.1:'+srv.address().port+'/index.html?width='+width+(process.env.APOLLO_STYLE?'&style='+process.env.APOLLO_STYLE:''));
 await page.waitForFunction(()=>window.ready||window.err,null,{timeout:45000});
 const err=await page.evaluate(()=>window.err);
 if(err)throw new Error(err);
 const start=Date.now();
 for(const [index,f] of frames.entries()){
   const dest=path.join(directory,'f'+String(f).padStart(4,'0')+'.jpg');
   if(process.env.APOLLO_RESUME&&fs.existsSync(dest))continue;
   const data=await page.evaluate(([f,cover])=>{
      window.renderFrame(f,cover);return document.getElementById('c').toDataURL('image/jpeg',.93).split(',')[1];
   },[f,process.env.APOLLO_COVER==='1']);
   fs.writeFileSync(dest,Buffer.from(data,'base64'));
   if(index%120===119)console.log((index+1)+' / '+frames.length);
 }
 console.log(frames.length+' fotogramas en '+((Date.now()-start)/1000).toFixed(1)+' s');
} finally {
 await browser.close();srv.close();
}
