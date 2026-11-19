
import * as T from './lib/three.module.js';
import {engineer} from './ingeniero.js';
import {ease} from './interior.js';
import {box, group, lighting, mesh, mat, rod, rng, vector} from './paint.js';
const artNames=['cabina','houston','normal','tormenta','despegue','orbita','aux-abajo','cohete'];
async function asset(name){
 const media=new Image();media.src='art/'+name+'.png';await media.decode();return [name,media];
}
export async function createPhotoStage(width,height){
 const assets=Object.fromEntries(await Promise.all(artNames.map(asset)));
 const n=width/1080, cw=1080,ch=1920;
 const vfx=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});
 vfx.setSize(width,height,false);vfx.setClearColor(0,0);
 const people=new T.Scene(), height3=4.40,width3=height3*width/height;
 const camera=new T.OrthographicCamera(-width3/2,width3/2,height3/2,-height3/2,.1,30);
 camera.position.set(0,0,8);camera.lookAt(0,0,0);
 const bean=engineer(people,{suit:true,variant:1,seated:true});
 const pete=engineer(people,{suit:true,variant:0,seated:true});
 const aaron=engineer(people,{variant:0,seated:true});
 const groupActors=[bean,pete,aaron];
 function actor(obj,x,y,scale,turn,t,action,strength){
   obj.rig.visible=true;obj.rig.position.set((x-.5)*width3+.09*scale,(.5-y)*height3-.42*scale,0);
   obj.rig.scale.setScalar(scale);obj.rig.rotation.y=turn;obj.update(t,action,strength);
 }
 const transport=new T.Scene();lighting(transport,0x80b6ff,0xffd6aa,3.0);
 const ship=group(transport);
 const craftProfile=[[0,-1.24],[.30,-1.23],[.32,-1.11],[.32,.01],[.28,.07],[.44,.14],[.42,.41],[.21,.82],[.10,.98],[0,1.05]];
 mesh(ship,new T.LatheGeometry(craftProfile.map(([x,y])=>new T.Vector2(x,y)),42),mat(0xe4e7e5));
 mesh(ship,new T.LatheGeometry([[.34,-1.25],[.20,-1.02],[.07,-.96],[.05,-1.25]].map(([x,y])=>new T.Vector2(x,y)),32),mat(0x526171));
 for(let i=0;i<32;i++){
   const a=i*Math.PI*2/32;box(ship,.016,.76,.016,Math.sin(a)*.322,-.54,Math.cos(a)*.322,0x909da2);
 }
 box(ship,.19,.092,.041,0,.55,.373,0x1a3b5c);
 box(ship,.137,.129,.033,0,-.24,.322,0xc99133);
 const arm=group(ship,-.30,-.31,.015);
 rod(arm,vector(0,0,0),vector(-.32,0,.11),.027,0x9da8a6);
 for(const y of [-.06,.08]) rod(arm,vector(-.31,0,.11),vector(-.40,y,.10),.035,0x9da8a6);
 const camOrbit=new T.PerspectiveCamera(32,width/height,.1,100);camOrbit.position.z=8.7;camOrbit.lookAt(0,0,0);
 const rocketPath=[
  [503,200],[506,207],[506,240],[507,255],[510,264],[513,270],[514,280],[518,294],[522,305],
  [527,315],[528,324],[529,344],[529,377],[532,400],[536,422],[540,444],[539,483],[540,514],
  [541,551],[541,581],[541,606],[541,633],[542,659],[542,699],[542,728],[544,745],[548,759],
  [560,773],[559,780],[547,784],[547,797],[551,808],[555,817],[555,829],[550,833],[534,828],
  [529,833],[512,836],[507,840],[494,836],[489,831],[479,834],[474,824],[468,819],[471,802],
  [473,788],[473,779],[458,778],[467,764],[473,752],[476,734],[476,701],[476,654],[476,611],
  [477,569],[475,542],[476,515],[477,485],[477,445],[478,427],[481,407],[483,389],[486,369],
  [489,347],[491,333],[494,319],[498,306],[500,294],[499,281],[499,272],[498,265],[500,254],
  [502,237],[502,218],[502,206]
 ];
 function rocket(ctx,x,y,scale,tilt,t){
   ctx.save();ctx.translate(x,y);ctx.rotate(tilt);ctx.scale(scale,scale);
   const flare=(Math.sin(t*40)*.13+Math.cos(t*57)*.068)+1;
   const g=ctx.createLinearGradient(0,600,0,935);g.addColorStop(0,'#fffef1');g.addColorStop(.20,'#fff9c3');g.addColorStop(.45,'#ffd259');g.addColorStop(.80,'rgba(255,124,22,.70)');g.addColorStop(1,'rgba(255,102,11,0)');
   ctx.save();ctx.translate(0,606);ctx.scale(1,flare);ctx.translate(0,-606);
   ctx.globalCompositeOperation='screen';ctx.shadowColor='#ff961d';ctx.shadowBlur=39;
   ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-40,573);ctx.bezierCurveTo(-37,643,-76,781,-17,907);
   ctx.bezierCurveTo(1,874,18,978,36,886);ctx.bezierCurveTo(81,769,43,663,52,585);ctx.closePath();ctx.fill();
   const f=ctx.createLinearGradient(0,610,0,854);f.addColorStop(0,'#ffffff');f.addColorStop(.51,'#fffad3');f.addColorStop(1,'rgba(255,204,77,0)');
   for(let j=0;j<3;j++){
     const offset=(j-1)*26;ctx.fillStyle=f;ctx.beginPath();ctx.moveTo(offset-11,583);ctx.bezierCurveTo(offset-22,694,offset-12,778,offset+4,816+14*Math.sin(t*48+j));ctx.quadraticCurveTo(offset+24,740,offset+10,580);ctx.fill();
   }
   const rand=rng(126);ctx.shadowBlur=7;
   for(let j=0;j<48;j++){
     const v=(t*1.57+rand())%1, side=rand()-.5, long=rand();
     ctx.fillStyle='rgba(255,'+(139+Math.round(long*99))+',65,'+((1-v)*.71)+')';
     ctx.fillRect(side*(49+v*157),594+v*(225+long*169),1.75+long*2.4,4+long*17);
   }
   ctx.restore();
   ctx.save();ctx.translate(-504,-200);ctx.beginPath();
   for(const [i,[px,py]] of rocketPath.entries())i?ctx.lineTo(px,py):ctx.moveTo(px,py);
   ctx.closePath();ctx.clip();ctx.drawImage(assets.cohete,0,0,941,1672);ctx.restore();
   ctx.restore();
 }
 function daylight(ctx,image,x=0,y=0,zoom=1){
   const w=cw*zoom,h=ch*zoom;ctx.drawImage(image,(cw-w)/2+x,(ch-h)/2+y,w,h);
 }
 function bolt(ctx,from,to,seed,alpha){
   const r=rng(seed);
   const trace=(a,b,count,jitter)=>{
     const pts=[a];
     for(let i=1;i<count;i++){
       const q=i/count;pts.push([a[0]+(b[0]-a[0])*q+(r()-.5)*jitter,a[1]+(b[1]-a[1])*q+(r()-.5)*jitter*.72]);
     }
     pts.push(b);return pts;
   };
   const branch=(nodes,line,blur)=>{
     ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#67ceff';ctx.shadowColor='#36b9ff';ctx.shadowBlur=blur;
     ctx.lineWidth=line*3.1;ctx.beginPath();nodes.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();
     ctx.shadowBlur=blur*.40;ctx.strokeStyle='#f0fdff';ctx.lineWidth=line;ctx.stroke();
   };
   ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=alpha;
   const points=trace(from,to,15,95);branch(points,5,36);
   for(let j=0;j<7;j++){
     const p=points[2+j*2];const dir=j%2===0?1:-1;
     branch(trace(p,[p[0]+dir*(95+r()*144),p[1]-(21+r()*80)],4,45),1.2,14);
   }
   ctx.restore();
 }
 function renderPerson(ctx,key,t){
   groupActors.forEach(p=>{p.rig.visible=false;});
   if(key==='cabin'||key==='reach'||key==='recover'){
     actor(pete,.258,.547,.52,.19,t+.63,key==='recover'?'idle':'work',.38);
     const x=key==='reach'?.670-ease((t-27.87)/1.45)*.028:.670;
     actor(bean,x,.496+(key==='cabin'?Math.sin(t*6)*.003:0),1.25,-.11,t,key==='cabin'?'alarm':key==='recover'?'relieved':'work',key==='reach'?.88:.60);
   }else{
     const recognition=key==='recognize', test=key==='test', radio=key==='radio';
     actor(aaron,radio?.327:.285,.509,1.20,.075,t,recognition?'point':key==='clear'?'relieved':'work',
       recognition?ease((t-16.65)/.88):radio?.66+ease((t-26.62)/.8)*.26:.55);
   }
   vfx.render(people,camera);
   ctx.save();
   ctx.beginPath();
   if(key==='cabin'||key==='reach'||key==='recover'){
     ctx.moveTo(0,0);ctx.lineTo(cw,0);ctx.lineTo(cw,1555);ctx.lineTo(858,1530);
     ctx.lineTo(795,1552);ctx.lineTo(337,1547);ctx.lineTo(205,1377);ctx.lineTo(0,1246);
   }else{
     ctx.moveTo(0,0);ctx.lineTo(cw,0);ctx.lineTo(cw,1411);ctx.lineTo(785,1440);
     ctx.lineTo(480,1418);ctx.lineTo(28,1502);ctx.lineTo(0,1510);
   }
   ctx.closePath();ctx.clip();
   ctx.drawImage(vfx.domElement,0,0,cw,ch);
   ctx.restore();
 }
 function screen(ctx,t,good,detail=false){
   const rand=(t*70)%123;
   ctx.save();
   ctx.transform(.835,.035,-.239,1.070,834,1023);
   const g=ctx.createRadialGradient(130,125,16,130,125,260);
   g.addColorStop(0,'#1c6022');g.addColorStop(.72,'#073915');g.addColorStop(1,'#08250f');
   ctx.fillStyle=g;ctx.beginPath();ctx.roundRect(0,0,284,208,24);ctx.globalAlpha=.87;ctx.fill();ctx.globalAlpha=1;ctx.clip();
   ctx.strokeStyle='rgba(93,231,105,.20)';ctx.lineWidth=1;
   for(let j=20;j<284;j+=22){ctx.beginPath();ctx.moveTo(j,0);ctx.lineTo(j,208);ctx.stroke();}
   for(let j=15;j<208;j+=20){ctx.beginPath();ctx.moveTo(0,j);ctx.lineTo(284,j);ctx.stroke();}
   ctx.fillStyle='rgba(162,255,126,.20)';ctx.fillRect(0,rand+20,284,3);
   const vals=good?['28.5','28.6','28.5']:['06.7','12.3','02.1'];
   ctx.shadowColor='#6aff25';ctx.shadowBlur=6;ctx.font='bold 23px Consolas';ctx.fillStyle='#b9ff9c';ctx.fillText('TELEMETRY',18,30);
   for(let i=0;i<3;i++){
     ctx.fillStyle='#8de578';ctx.font='20px Consolas';ctx.fillText(['BUS A','BUS B','AUX'][i],21,78+i*47);
     ctx.fillStyle=good?'#c5ffa0':'#e4ff82';ctx.font='bold 32px Consolas';ctx.fillText(vals[i],155,80+i*47);
   }
   ctx.restore();
 }
 function alarmGlow(ctx,t,good){
   ctx.save();ctx.globalCompositeOperation=good?'color':'screen';
   const points=[[155,271],[226,355],[205,420],[152,550],[67,482]];
   for(const [i,[x,y]] of points.entries()){
     const size=i%2?116:145, g=ctx.createRadialGradient(x,y,20,x,y,size);
     const beat=.17+.19*Math.max(0,Math.sin(t*7.7+i*.55));g.addColorStop(0,good?'rgba(18,193,139,.56)':'rgba(255,'+(i>2?'78':'135')+',23,'+beat+')');g.addColorStop(1,'rgba(255,164,29,0)');
     ctx.fillStyle=g;ctx.fillRect(x-size,y-size,size*2,size*2);
   }ctx.restore();
 }
 function hand(ctx,t,when){
   const reach=ease((t-29.55)/.63),switching=ease((t-(when-.16))/.16);
   const release=ease((t-31.16)/.38);
   const x=389+reach*210-switching*130-release*98, y=1134-reach*205+switching*429+release*53;
   ctx.save();ctx.lineWidth=19;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#221c21';
   ctx.beginPath();ctx.moveTo(-30,1530);ctx.quadraticCurveTo(142,1320,208,1270);ctx.lineTo(x-45,y+22);ctx.stroke();
   ctx.translate(x,y);ctx.rotate(-.40+switching*.32);
   ctx.fillStyle='#fffdf8';ctx.lineWidth=11;
   ctx.beginPath();ctx.moveTo(-75,30);ctx.bezierCurveTo(-86,2,-66,-26,-38,-30);
   ctx.bezierCurveTo(-2,-49,47,-43,56,-20);ctx.bezierCurveTo(68,5,44,30,21,31);
   ctx.bezierCurveTo(3,49,-32,56,-45,43);ctx.lineTo(-75,30);ctx.fill();ctx.stroke();
   ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-34,-18);ctx.quadraticCurveTo(-15,-25,-3,-22);
   ctx.moveTo(-28,-4);ctx.quadraticCurveTo(-9,-9,1,-6);ctx.stroke();
   ctx.restore();
 }
 return {frame(ctx,t,set,key,events){
   ctx.save();ctx.scale(n,n);
   if(set==='launch'){
     const z=1.023+t*.021;
     daylight(ctx,assets.despegue,-t*10,t*8,z);
     rocket(ctx,583-t*6,415-t*103,1.07+t*.04,-.028,t);
   }else if(set==='storm'){
     const k=t-(key===1?5.03:2.66),rise=k*20;
     daylight(ctx,assets.tormenta,key===1?42-k*36:-41+k*31,20+rise,1.15+k*.038);
     const x=key===1?577-k*72:501+k*22,y=key===1?358-k*56:414-k*51,sc=key===1?1.36-k*.054:1.40+k*.075, angle=key===1?.23:.15;
     rocket(ctx,x,y,sc,angle,t);
     const hit=key===1?events.second:events.first, dt=t-hit;
     if(dt>=0&&dt<.27){
       const a=Math.max(0,1-dt/.27);
       bolt(ctx,key===1?[-12,70]:[1100,42],[x-21,y+130],key===1?882:629,a);
       if(key===0)bolt(ctx,[x-77,y+908],[-150,2040],482,a*.61);
       const glow=ctx.createRadialGradient(x,y+100,10,x,y+130,650);glow.addColorStop(0,'rgba(127,204,255,'+(a*.41)+')');glow.addColorStop(1,'rgba(127,204,255,0)');
       ctx.fillStyle=glow;ctx.fillRect(0,0,cw,ch);
     }
   }else if(set==='cabin'){
     const a=key==='alarm', k=t-(a?8.08:key==='reach'?27.87:34.06);
     const drift=a?1.024+.008*k:1.04+.014*k;
     ctx.translate(cw/2,ch/2);ctx.scale(drift,drift);ctx.translate(-cw/2-k*7,-ch/2+k*5);
     daylight(ctx,assets.cabina);
     alarmGlow(ctx,t,key==='recover');
     renderPerson(ctx,a?'cabin':key,t);
   }else if(set==='control'){
     const detail=key==='numbers'||key==='clear',test=key==='test';
     const k=t-(key==='clear'?31.90:detail?11.86:test?19.57:key==='radio'?26.34:15.58);
     const zoom=detail?1.67+Math.min(.091,k*.028):1.02+Math.min(.10,k*.022);
     ctx.translate(cw/2,ch/2);ctx.scale(zoom,zoom);
     ctx.translate(-cw/2+(detail?-((zoom-1)/zoom)*536:-k*2),-ch/2+(detail?-((zoom-1)/zoom)*347:0));
     daylight(ctx,assets.houston);
     if(!detail)renderPerson(ctx,key,t);
     screen(ctx,t,key==='clear',detail);
     if(test){
       ctx.fillStyle='rgba(33,22,10,.18)';ctx.fillRect(0,0,cw,ch);
       ctx.fillStyle='#ffdda4';ctx.font='bold 36px Arial';ctx.fillText('PRUEBA EN TIERRA',151,394);
     }
   }else if(set==='mechanism'){
     const active=key==='toggle', k=t-(active?29.50:22.76);
     const zoom=1.023+Math.min(.085,k*.019);
     ctx.translate(cw*.5,ch*.5);ctx.scale(zoom,zoom);ctx.translate(-cw*.5+k*6,-ch*.5+k*3);
     const amount=active?ease((t-(events.toggle-.036))/.043):0;
     daylight(ctx,assets.normal);
     if(amount>0){
       ctx.save();ctx.globalAlpha=amount;ctx.beginPath();
       ctx.moveTo(395,888);ctx.lineTo(699,863);ctx.lineTo(736,1427);ctx.lineTo(429,1507);
       ctx.lineTo(383,1200);ctx.closePath();ctx.clip();daylight(ctx,assets['aux-abajo']);ctx.restore();
     }
     if(active)hand(ctx,t,events.toggle);
   }else{
     const k=t-37.43;daylight(ctx,assets.orbita,k*-12,k*6,1.035+k*.02);
     ship.position.set(-1.16+k*.45,-.77+k*.26,0);ship.rotation.set(.18+k*.06,.22+k*.18,-1.00+k*.05);ship.scale.setScalar(.73-k*.05);
     vfx.render(transport,camOrbit);ctx.drawImage(vfx.domElement,0,0,cw,ch);
   }
   ctx.restore();
 }};
}
