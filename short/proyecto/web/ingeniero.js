import * as T from './lib/three.module.js';
import {rod, aim, vector, box} from './paint.js';

// Inked, shallow extrusions keep the drawn shapes readable in the lit 3D set.
export function engineer(scene, {suit=false, variant=0, seated=false}={}) {
 const rig=new T.Group(),body=new T.Group(),head=new T.Group(),face=new T.Group();
 scene.add(rig);rig.add(body);body.add(head);head.add(face);
 const black=0x211c20,white=0xffffff;
 const materials=new Map();
 function paint(color){
   if(!materials.has(color))materials.set(color,new T.MeshBasicMaterial({color,toneMapped:false}));
   return materials.get(color);
 }
 function shape(parent,x,y,z,commands,color,depth=.006){
   const path=new T.Shape();
   for(const [op,...v] of commands)path[op](...v);
   const geometry=new T.ExtrudeGeometry(path,{depth,bevelEnabled:false,curveSegments:24});
   const item=new T.Mesh(geometry,paint(color));item.position.set(x,y,z);parent.add(item);return item;
 }
 const M=(x,y)=>['moveTo',x,y],L=(x,y)=>['lineTo',x,y],Q=(...v)=>['quadraticCurveTo',...v],B=(...v)=>['bezierCurveTo',...v];
 function curve(parent,points,r,color){
   const pts=points.map(p=>new T.Vector3(...p)),c=new T.CatmullRomCurve3(pts);
   let m=new T.Mesh(new T.TubeGeometry(c,24,r,10,false),paint(color));parent.add(m);return m;
 }
 const ball=new T.SphereGeometry(1,28,16);
 function oval(parent,x,y,z,a,b,d,color){
   const m=new T.Mesh(ball,paint(color));m.position.set(x,y,z);m.scale.set(a,b,d);parent.add(m);return m;
 }
 function outline(parent,x,y,z,commands,color,sx,sy){
   const item=shape(parent,x,y,z,commands,black,.035);
   const fill=shape(parent,x,y,z+.037,commands,color);fill.scale.set(sx,sy,1);
   return item;
 }
 // Legs remain visible below the shirt, with just a short black stroke for each shoe.
 for(const [x,k,foot] of [[-.216,-.19,-.24],[.020,.061,.125]]){
   if(seated){
     curve(body,[[x,-.49,.013],[k+.04,-.65,.31],[foot+.14,-.85,.34]],.017,black);
     curve(body,[[foot+.14,-.85,.34],[foot+.20,-.87,.37]],.019,black);
   }else{
     curve(body,[[x,-.49,0],[k,-.80,.01],[foot,-1.125,.032]],.017,black);
     curve(body,[[foot,-1.125,.032],[foot+.019,-1.154,.048],[foot+.058,-1.153,.057]],.019,black);
   }
 }
 const coat=[M(-.20,.29),Q(-.25,.25,-.25,.14),L(-.252,-.26),Q(-.25,-.333,-.202,-.34),Q(-.009,-.365,.182,-.329),Q(.222,-.324,.225,-.25),L(.223,.16),Q(.22,.27,.156,.293),Q(.02,.33,-.20,.29)];
 outline(body,-.074,-.236,.00,coat,suit?0xf5e5bf:0xf4f1e5,.937,.944);
 // Folded blue collar, a chest pocket and a narrow work belt.
 shape(body,-.08,.012,.056,[M(-.122,.026),L(-.034,-.11),L(.007,-.049),L(.053,-.10),L(.14,.041),L(.042,.054),L(-.034,.034)],black);
 shape(body,-.08,.012,.066,[M(-.101,.024),L(-.037,-.077),L(-.009,-.042),L(-.046,.018)],suit?0xfff2d3:0xffffff);
 shape(body,-.08,.012,.066,[M(.015,-.043),L(.05,-.070),L(.111,.019),L(.06,.03)],suit?0xfff2d3:0xffffff);
 curve(body,[[-.083,-.071,.06],[-.089,-.268,.062],[-.085,-.497,.064]],.006,0x343a40);
 shape(body,.05,-.19,.055,[M(-.04,.023),L(.086,.023),L(.083,-.060),Q(.028,-.105,-.037,-.061)],0x34434b);
 shape(body,.05,-.19,.063,[M(-.028,.011),L(.073,.011),L(.07,-.055),Q(.026,-.084,-.027,-.054)],suit?0xf9edd8:0xf5f0de);
 curve(body,[[-.296,-.521,.048],[-.080,-.54,.075],[.128,-.516,.048]],.018,0x312e30);
 // Asymmetric hand-drawn cranium, white face and dark hair with a loose forelock.
 head.position.set(-.097,.42,.065);
 const skull=[M(-.489,.044),B(-.502,.297,-.33,.458,-.086,.466),B(.166,.501,.417,.384,.465,.16),B(.532,-.088,.405,-.304,.231,-.39),B(.091,-.465,-.139,-.462,-.299,-.373),B(-.429,-.294,-.484,-.154,-.489,.044)];
 outline(head,0,0,0,skull,white,.948,.946);
 shape(head,0,0,.055,[M(-.480,.052),B(-.503,.262,-.37,.44,-.16,.472),B(-.031,.516,.163,.489,.278,.421),B(.386,.387,.463,.28,.476,.122),Q(.367,.17,.263,.254),Q(.189,.31,.109,.324),Q(-.086,.298,-.217,.211),Q(-.365,.122,-.461,.060)],black,.014);
 shape(head,0,0,.074,[M(-.436,.12),Q(-.31,.363,-.034,.429),Q(.159,.47,.30,.359),Q(.109,.438,-.041,.389),Q(-.29,.33,-.436,.12)],variant===1?0x5c4433:0x454047);
 shape(head,0,0,.077,[M(-.329,.304),Q(-.092,.509,.118,.444),Q(-.1,.456,-.329,.304)],0x665e61);
 shape(head,0,0,.076,[M(.134,.352),Q(.238,.355,.318,.273),Q(.195,.304,.131,.295),Q(.15,.32,.134,.352)],black);
 const eyes=[],brows=[];
 for(const [cx,cy,tilt] of [[-.085,.053,-.07],[.171,.063,-.015]]){
   const e=new T.Group();e.position.set(cx,cy,.078);e.rotation.z=tilt;face.add(e);
   shape(e,0,0,0,[M(-.043,.016),Q(-.041,-.080,.007,-.073),Q(.040,-.068,.041,.016)],0x373238);
   curve(e,[[-.079,.017,.019],[-.019,.026,.019],[.079,.019,.019]],.010,black);eyes.push(e);
   const b=shape(face,cx,cy+.145,.088,[M(-.081,-.012),Q(-.035,.042,.046,.028),Q(.080,.021,.080,.005),Q(.014,.016,-.052,-.014),Q(-.070,-.024,-.081,-.012)],black);brows.push(b);
 }
 const smile=shape(face,.062,-.164,.081,[M(-.065,.006),Q(-.001,-.024,.086,.024),Q(.029,-.062,-.020,-.035),Q(-.048,-.020,-.065,.006)],0x30272b);
 const surprise=oval(face,.088,-.149,.08,.028,.041,.010,0x352c31);

 if(suit){
   const collar = new T.Mesh(new T.TorusGeometry(.205,.021,10,32), paint(0x404655));
   collar.rotation.x=Math.PI/2.65; collar.position.set(-.075,-.055,.032); body.add(collar);
   const chest=box(body,.27,.16,.017,-.067,-.204,.088,black,true);
   box(body,.24,.133,.021,-.067,-.204,chest.position.z+.009,0xb7c4cc,true);
   box(body,.079,.026,.009,-.105,-.181,.113,0xf29231,true);
   box(body,.079,.022,.009,-.105,-.228,.113,0x346aa6,true);
   oval(body,.009,-.194,.122,.033,.033,.009,0xcf422e);
 }else{
   shape(body,-.078,-.025,.079,[M(-.023,0),L(.028,0),L(.024,-.05),L(.048,-.35),L(0,-.40),L(-.041,-.35),L(-.019,-.055)],variant===2?0x5878a1:0x426745);
 }
 const arms = [-.301,.145].map(x=>{
   const start = vector(x,-.035,.051);
   const elbow = vector(x*1.20,-.23,.08);
   const end = vector(x*1.15,-.41,.232);
   return {start,upper:rod(body,start,elbow,.017,black,true),fore:rod(body,elbow,end,.017,black,true),
     outer:oval(body,end.x,end.y,end.z,.043,.034,.025,black),
     inner:oval(body,end.x,end.y,end.z+.014,.034,.026,.021,white)};
 });
 function moveArm(arm,elbow,end){
   aim(arm.upper,arm.start,elbow,.017); aim(arm.fore,elbow,end,.017);
   arm.outer.position.copy(end); arm.inner.position.copy(end); arm.inner.position.z+=.015;
 }
 return {rig,update(t,action='idle',strength=1) {
   const wave=.012*Math.sin(t*3);
   const alarm=action==='alarm', point=action==='point', work=action==='work'||action==='talk', relieved=action==='relieved';
   head.rotation.z=(alarm?-.09:point?.075:work?-.055:.016)+wave;
   head.rotation.y=point?.145:work?.055:.018*Math.sin(t*2);
   const blink=(t+variant*.47)%3.37;
   for(const eye of eyes) eye.scale.y=blink>3.23?.16:(alarm?1.15:1);
   brows[0].rotation.z=alarm?.29:point?.14:.03;
   brows[1].rotation.z=alarm?-.31:point?-.25:-.07;
   brows[0].position.y=.198+(alarm?.04:0);
   brows[1].position.y=.208+(alarm?.04:0);
   smile.visible=point||relieved||action==='idle'; surprise.visible=!smile.visible;
   surprise.scale.y=action==='talk'?.018+.015*Math.abs(Math.sin(t*13)):alarm?.042:.027;
   body.position.y=wave*.42;
   moveArm(arms[0],vector(-.36,-.25,.12),vector(-.24,-.26+(alarm?.09:0)+wave,.35));
   moveArm(arms[1],vector(.23+((point||work)?strength*.15:0),-.25+((point||work)?.11:0),.12),
           vector(.21+((point||work)?strength*.44:0),-.38+((point||work)?strength*.43:0)+wave,.35));
 }};
}
