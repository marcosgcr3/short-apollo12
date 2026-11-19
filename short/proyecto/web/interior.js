
import * as T from './lib/three.module.js';
import {aim, box, group, label, lighting, mat, mesh, orb, rng, rod, shape, vector} from './paint.js';
import {engineer} from './ingeniero.js';
import {skies} from './exterior.js';
export const ease=x=>{ const v=Math.max(0,Math.min(1,x)); return v*v*(3-2*v); };
const ink=0x211c20;
const steel=0x436475, deep=0x304554, light=0x9aa8a6, graphite=0x1d3441;
function rivet(parent,x,y,z,r=.024) {
  const o=orb(parent,x,y,z,r,r,r*.48,0x9da8a8);
  box(o.parent,r*.98,r*.15,r*.16,x,y,z+r*.43,0x354957);
}
function led(parent,x,y,z,w,h,color) {
  box(parent,w+.043,h+.04,.042,x,y,z,0x2c3338);
  const item=box(parent,w,h,.037,x,y,z+.029,color,true);item.material=item.material.clone();
  box(parent,w*.83,.012,.007,x,y+h*.35,z+.052,0xf3d393,true);
  return item;
}
function screen(parent,w,h,x,y,z,mode) {
  box(parent,w+.13,h+.12,.14,x,y,z,0x212d35);
  box(parent,w+.035,h+.035,.078,x,y,z+.065,0x233f35);
  const c=document.createElement('canvas');c.width=448;c.height=264;
  const p=c.getContext('2d'), tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.minFilter=T.LinearFilter;
  mesh(parent,new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex}),x,y,z+.111);
  function draw(t,issue,selected=false){
    const bg=p.createRadialGradient(217,130,15,217,130,252);
    bg.addColorStop(0,'#132e28');bg.addColorStop(1,'#071912');p.fillStyle=bg;p.fillRect(0,0,448,264);
    p.strokeStyle='#244735';p.lineWidth=1;
    for(let i=24;i<448;i+=35){p.beginPath();p.moveTo(i,0);p.lineTo(i,264);p.stroke();}
    for(let i=17;i<264;i+=28){p.beginPath();p.moveTo(0,i);p.lineTo(448,i);p.stroke();}
    p.fillStyle=selected?'#e5ff90':'#92f19a';p.font='bold 23px Consolas';p.fillText(mode==='cabin'?'DC BUS':'TELEMETRY',22,34);
    p.textAlign='right';p.fillText(issue?'?':'OK',420,34);p.textAlign='left';
    const values=issue?['06.7','12.3','02.1']:['28.5','28.6','28.5'];
    if(mode!=='cabin'){
      p.font=selected?'bold 43px Consolas':'bold 33px Consolas';
      for(let i=0;i<3;i++){
        p.fillStyle='#67ab71';p.font='23px Consolas';p.fillText(['BUS A','BUS B','AUX'][i],25,96+i*56);
        p.font=selected?'bold 43px Consolas':'bold 33px Consolas';p.fillStyle=issue?'#ffd66b':'#a7ffa5';p.fillText(values[i],244,97+i*56);
      }
    }else{
      p.strokeStyle=issue?'#ffad50':'#a9ffa3';p.lineWidth=5;p.beginPath();
      for(let i=0;i<40;i++){const q=i*10+23,k=135+(issue?Math.sin(i*1.98+t*4)*27:Math.sin(i*.24+t*4)*9); if(i)p.lineTo(q,k);else p.moveTo(q,k);}
      p.stroke();p.fillText(issue?'LOW VOLTAGE':'POWER ONLINE',22,240);
    }
    const scan=(t*66)%264;p.fillStyle='rgba(174,255,173,.12)';p.fillRect(0,scan,448,3);tex.needsUpdate=true;
  }
  return draw;
}
function gauge(parent,x,y,z,r){
  const body=orb(parent,x,y,z,r,r,.038,0x22323b);
  orb(parent,x,y,z+.027,r*.83,r*.83,.024,0x263b46,true);
  for(let j=0;j<9;j++){
    const a=-.6+j*.52;
    rod(parent,vector(x+Math.sin(a)*r*.62,y+Math.cos(a)*r*.62,z+.053),vector(x+Math.sin(a)*r*.75,y+Math.cos(a)*r*.75,z+.053),.004,0xd8e3d7,true);
  }
  const needle=rod(parent,vector(x,y,z+.058),vector(x+r*.29,y+r*.56,z+.058),.006,0xefa556,true);
  body.userData.sweep=(a)=>aim(needle,vector(x,y,z+.058),vector(x+Math.sin(a)*r*.66,y+Math.cos(a)*r*.66,z+.058),.006);
  return body;
}
function consoleBody(parent,x,y,z,width=1.33){
  const g=group(parent,x,y,z);
  box(g,width,.15,.82,0,-.12,.10,0x9b8573);
  box(g,width,.88,.34,0,.34,-.20,steel);
  box(g,width*.94,.79,.044,0,.34,-.012,0x536f73);
  for(const a of [-.55,.55]) for(const b of [.005,.69]) rivet(g,a*width*.95,b,.022,.018);
  for(let j=0;j<7;j++){
    box(g,.105,.041,.082,-.41+j*.137,-.026,.26,0x25383d);
    box(g,.082,.024,.065,-.41+j*.137,-.006,.264,[0xd2b77e,0xd6d1bc,0x7faba3][j%3]);
  }
  for(let j=0;j<3;j++) led(g,.44,.53-j*.19,.024,.078,.065,j===1?0xf9ad40:0xb3d18b);
  return g;
}
function windowView(scene,x,y,z,w,h) {
  const frame=group(scene,x,y,z);
  const p=[[-w*.52,-h*.50],[w*.58,-h*.50],[w*.40,h*.54],[-w*.35,h*.57]];
  shape(frame,p,0x7c8486,.00);
  const border=p.map(([a,b])=>[a*.87,b*.84]);shape(frame,border,0x273d4f,.014);
  const glass=p.map(([a,b])=>[a*.76,b*.72]);
  const path=new T.Shape(glass.map(([a,b])=>new T.Vector2(a,b)));
  const geom=new T.ShapeGeometry(path);
  const uv=geom.attributes.uv;
  const pos=geom.attributes.position;
  for(let i=0;i<uv.count;i++)uv.setXY(i,.29+pos.getX(i)/w*.63,.58+pos.getY(i)/h*.57);
  const clouds=skies.storm.clone();clouds.needsUpdate=true;
  mesh(frame,geom,new T.MeshBasicMaterial({map:clouds}),0,0,.026);
  for(const [a,b] of p)rivet(frame,a*.94,b*.91,.032,.035);
  return clouds;
}
function chair(scene,x,y,z,angle=0) {
  const s=group(scene,x,y,z);s.rotation.y=angle;
  box(s,.81,.83,.22,0,.11,-.17,0x334952);
  box(s,.72,.77,.17,0,.16,-.025,0x6c5240);
  box(s,.64,.67,.17,0,.18,.034,0x99704d);
  box(s,.76,.16,.67,0,-.32,.13,0x7e5e46);
  for(const b of [-.41,.41]) box(s,.075,.07,.47,b,-.05,.24,0x9e9a88);
}
export function makeCabin(){
  const scene=new T.Scene();scene.background=new T.Color(0x193245);lighting(scene,0x7ccaff,0xffcb98,2.6);
  box(scene,12,5,.26,0,1.8,-2.25,0x405d70);
  box(scene,10,.30,5.5,0,3.25,-.48,0x687d84);
  box(scene,10,.24,6.3,0,.21,.1,0x2b4354);
  for(let j=0;j<6;j++){
    const x=-3.6+j*1.42;
    box(scene,1.32,1.63,.09,x,1.13,-2.04,j%2?0x3d6473:0x324f61);
    rivet(scene,x-.57,1.87,-1.99);rivet(scene,x+.57,1.87,-1.99);
    for(let n=0;n<5;n++){box(scene,.12,.078,.045,x-.45+n*.216,.54,-1.97,0x9aa8a6);gauge(scene,x-.42+n*.20,1.11,-1.94,.067);}
    rod(scene,vector(x-.66,1.96,-1.91),vector(x-.66,3.16,-.97),.047,0x9ba5a7);
  }
  const window=windowView(scene,1.04,2.48,-1.99,1.78,1.09);
  const portLight=new T.PointLight(0x4acbff,8,6.0,1.60);portLight.position.set(1.03,2.60,-.78);scene.add(portLight);
  for(const [x,color] of [[-1.75,0xffac48],[.15,0x4ed9ff],[1.75,0xffca79]]){
    box(scene,.64,.039,.16,x,3.07,-.87,color,true);
    const light=new T.PointLight(color,3.6,3.3,1.75);light.position.set(x,2.91,-.75);scene.add(light);
  }
  rod(scene,vector(-2.8,2.96,-1.32),vector(2.0,2.96,-1.32),.083,0xcabee1);
  rod(scene,vector(-2.8,2.84,-1.35),vector(2.0,2.84,-1.35),.039,0x53626d);
  chair(scene,.59,1.12,-.20,-.08);chair(scene,-1.03,1.02,-.86,.12);
  const bean=engineer(scene,{suit:true,variant:1,seated:true});bean.rig.position.set(.60,1.53,.16);bean.rig.rotation.y=-.17;bean.rig.scale.setScalar(1.10);
  const partner=engineer(scene,{suit:true,variant:0,seated:true});partner.rig.position.set(-1.00,1.45,-.62);partner.rig.rotation.y=.17;partner.rig.scale.setScalar(.92);
  const bank=group(scene,-1.02,1.19,.68);bank.rotation.set(-.17,.42,.08);
  const alertGlow=new T.PointLight(0xff6a25,17,3,1.88);alertGlow.position.set(-.8,2.07,1.08);scene.add(alertGlow);
  box(bank,1.16,1.48,.27,0,.32,0,0x567688);
  const lights=[];
  for(let i=0;i<6;i++){const x=-.31+(i%2)*.40,y=.91-Math.floor(i/2)*.20;lights.push(led(bank,x,y,.17,.31,.15,i>3?0xec4928:0xff982b));}
  const gauges=Array.from({length:4},(_,i)=>gauge(bank,-.4+i*.24,.25,.14,.087));
  const status=screen(bank,.78,.35,-.05,-.095,.17,'cabin');
  const front=group(scene,.40,.67,1.08);front.rotation.x=-.19;
  box(front,2.82,.29,.52,0,0,0,0x526b75);
  for(let i=0;i<10;i++){
    const x=-1.20+i*.25;
    box(front,.12,.05,.07,x,.154,.05,0x212e36);rod(front,vector(x,.17,.05),vector(x,.234,.08),.017,0xd2c4ac);
  }
  return {scene,frame(t,camera,key){
    const insert=key==='alarmPanel',active=key==='alarm'||insert,good=key==='recover';
    bean.update(t,active?'alarm':good?'relieved':'work',.67+ease((t-28.6)/.9)*.28);
    partner.update(t+.71,active?'work':good?'relieved':'idle',.42);
    const palette=[0xffb42c,0xffad28,0xfe9c23,0xff9929,0xff4220,0xff6528];
    for(let i=0;i<lights.length;i++)lights[i].material.color.setHex(good?i%2?0x5dbc7a:0x324a47:((Math.floor(t*3.46)+i)%7===0?0x8c4121:palette[i]));
    gauges.forEach((g,i)=>g.userData.sweep(good?.85+i*.10:1.4+.47*Math.sin(8*t+i)));
    alertGlow.color.setHex(good?0x56e984:0xff7227);alertGlow.intensity=(good?8:12)+(Math.sin(t*8)+1)*4;
    portLight.intensity=7.5+Math.sin(t*3)*1.8;
    window.offset.set(.021*Math.sin(t*.84),-.023*Math.sin(t*1.05));
    status(t,active);
    const k=insert?t-10.66:active?t-8.08:key==='reach'?t-27.87:t-34.06;
    camera.fov=insert?49:active?58:key==='reach'?52:55;
    if(insert){
      camera.position.set(-.62-k*.35,2.01+k*.075,2.78-k*.26);
      camera.lookAt(-1.03,1.83,1.00);
      bean.rig.rotation.y=-.18;
      bean.rig.rotation.z=0;
    }else if(active){
      camera.position.set(.93-k*.31,2.01+k*.08,4.38-k*.21);
      const push=ease((t-9.72)/1.40);
      camera.position.z-=push*.35;
      camera.lookAt(-.17+k*.055+push*.20,1.80+push*.06,.19);
      bean.rig.rotation.y=-.22+.105*Math.sin(k*1.6);
      bean.rig.rotation.z=Math.sin(k*31)*.066*Math.exp(-k*2.4);
    }else if(key==='reach'){
      camera.position.set(-.23+k*.42,1.75+k*.21,3.68-k*.21);
      camera.lookAt(.55,1.68,.23);
      bean.rig.rotation.y=-.08-ease(k/1.45)*.36;bean.rig.rotation.z=-.13*ease(k/1.2);
    }else{
      camera.position.set(-.73+k*.28,1.96+k*.11,3.99+k*.16);
      camera.lookAt(.25,1.73,.20);
      bean.rig.rotation.y=-.30+k*.13;bean.rig.rotation.z=.045*Math.sin(k*2.2);
    }
  }};
}
function wallMap(scene){
  const map=group(scene,0,2.58,-4.4);
  const w=7.4,h=2.0;
  box(map,w+.14,h+.14,.15,0,0,0,0x202d3b);
  box(map,w,h,.06,0,0,.09,0x14518d,true);
  for(let i=0;i<15;i++)box(map,.017,h-.08,.012,-3.29+i*.47,0,.13,0x4e85ae,true);
  for(let i=0;i<6;i++)box(map,w-.14,.016,.012,0,-.81+i*.325,.13,0x528bb5,true);
  const path=[[-3.43,-.62],[-2.50,-.43],[-1.87,-.23],[-.95,.12],[-.04,.36],[.91,.49],[2.05,.54],[3.42,.42]];
  for(let i=1;i<path.length;i++)rod(map,vector(...path[i-1],.159),vector(...path[i],.159),.018,0x88e4ff,true);
  const marker=orb(map,.91,.49,.16,.061,.061,.025,0xe2ffff,true);
  const gridLand=[
    [[-2.65,.64],[-2.1,.71],[-1.72,.58],[-1.42,.30],[-1.74,.24],[-1.83,-.03],[-2.30,.19],[-2.57,.39],[-2.65,.64]],
    [[-1.78,.01],[-1.27,-.04],[-.99,-.25],[-1.24,-.64],[-1.39,-.77],[-1.59,-.46],[-1.73,-.32],[-1.78,.01]],
    [[-.43,.57],[.03,.17],[.49,.20],[.82,.05],[.89,-.25],[.56,-.70],[.27,-.50],[.07,-.21],[.03,.17]],
    [[.03,.56],[.39,.72],[.86,.62],[1.5,.69],[2.13,.48],[2.69,.52],[2.85,.29],[2.51,.18],[1.91,.27],[1.47,-.05],[1.02,.03],[.77,.3],[.49,.20]],
    [[2.07,-.33],[2.42,-.26],[2.8,-.31],[2.90,-.53],[2.60,-.69],[2.23,-.59],[2.07,-.33]]
  ];
  for(const shape of gridLand)for(let i=1;i<shape.length;i++)rod(map,vector(...shape[i-1],.156),vector(...shape[i],.156),.020,0x64abd3,true);
  return t=>{marker.position.x=.70+.54*Math.sin(t*.41);marker.position.y=.34+marker.position.x*.13;};
}
export function makeControl(){
  const scene=new T.Scene();scene.background=new T.Color(0x162a47);lighting(scene,0xa3d9ff,0xffd9ab,2.6);
  box(scene,15,.25,13,0,.27,-2.8,0x344b55);
  box(scene,14,6,.27,0,1.9,-4.62,0x668598);
  for(let i=0;i<8;i++){
    box(scene,.060,2.3,.03,-4.4+i*1.26,1.48,-4.45,0x476271);
    box(scene,1.12,.075,.04,-4.4+i*1.26,1.31,-4.45,0xa1a4a1);
  }
  const track=wallMap(scene);
  const wash=new T.PointLight(0x48a6fa,31,8,1.6);wash.position.set(.83,2.75,-3.14);scene.add(wash);
  const deskGlow=new T.PointLight(0xa6f567,9,4,1.72);deskGlow.position.set(.77,1.41,1.51);scene.add(deskGlow);
  for(let i=0;i<15;i++){
    const x=-4.9+i*.72;box(scene,.06,.04,7.2,x,3.85,-1.7,0x476271);
    if(i%2===0)box(scene,.49,.05,.65,x+.31,3.81,-2.0,0xffdfa6,true);
  }
  const people=[];const monitors=[];
  for(let row=0;row<2;row++)for(let j=0;j<5;j++){
    const x=-3.2+j*1.56+row*.35,z=-1.57-row*1.50,y=.78+row*.12;
    const g=consoleBody(scene,x,y,z,1.17);
    const draw=screen(g,.55,.43,-.13,.38,.03,'control');
    draw(row+j,true);monitors.push(draw);
    if(j===1||j===3){
      const p=engineer(scene,{variant:j%3});p.rig.scale.setScalar(.63);p.rig.position.set(x-.28,1.47+row*.10,z-.43);p.rig.rotation.y=-.31;
      people.push(p);
    }
  }
  chair(scene,-.58,1.10,.15);
  const aaron=engineer(scene,{variant:0,seated:true});aaron.rig.position.set(-.59,1.57,.35);aaron.rig.scale.setScalar(1.12);
  const desk=consoleBody(scene,.73,.98,.88,1.41);desk.rotation.y=-.12;
  const selected=screen(desk,.81,.52,-.06,.38,.048,'control');
  const lamps=group(desk,-.57,.75,-.07);
  rod(lamps,vector(0,-.72,.25),vector(0,.06,.28),.017,0x9c9381);
  rod(lamps,vector(0,.06,.28),vector(.08,.14,.39),.019,0xaba18e);
  orb(lamps,.11,.11,.445,.11,.044,.079,0xb1814a);
  box(desk,.20,.027,.24,-.42,-.022,.46,0xddd6ac);
  box(scene,2.35,.17,.76,-.08,.83,.95,0x786d5f);
  box(scene,.58,.033,.26,-.64,.937,1.03,0xeacc95);
  const pencil=rod(scene,vector(-.86,.962,1.04),vector(-.48,.962,1.10),.009,0x315274);
  const mic=group(scene,-.13,.98,1.12);
  box(mic,.24,.038,.095,0,-.012,.08,0x314046);
  rod(mic,vector(0,0,.08),vector(.035,.28,-.025),.018,0xa89569);
  const micTop=orb(mic,.035,.277,-.028,.057,.045,.072,0x555650);
  micTop.rotation.x=-.42;
  const onAir=led(scene,-.09,1.06,1.137,.07,.034,0xa84b24);
  const testSheet=label(scene,'PRUEBA EN TIERRA',1.10,.12,-.37,2.48,.72,{color:'#ffdda0'});
  return {scene,frame(t,camera,key){
    const issue=key!=='clear',recognize=key==='recognize',test=key==='test',radio=key==='radio',detail=key==='numbers'||key==='clear';
    aaron.update(t,radio?'talk':recognize?'point':test?'work':issue?'alarm':'relieved',recognize?ease((t-16.64)/.70):.72);
    aaron.rig.position.x=-.59+(radio?ease((t-26.34)/.68)*.12:0);
    aaron.rig.rotation.y=radio?.28:recognize?.14+.14*ease((t-16.2)/1.15):test?-.19:.03;
    mic.rotation.z=radio?ease((t-26.35)/.64)*.11:0;
    onAir.material.color.setHex(radio?0xff6236:0x914b30);
    testSheet.visible=test;
    pencil.rotation.y=test?.19*Math.sin(t*4.6):.13;
    track(t);
    deskGlow.intensity=7.6+(issue?Math.sin(t*8)*2.1:1.9);
    wash.color.setHex(test?0xf4a96f:0x48a6fa);
    wash.intensity=test?17:31;
    for(const [i,draw] of monitors.entries()) if(i%2===Math.floor(t*5)%2)draw(t+i*(.23),issue);
    people.forEach((p,i)=>p.update(t*.83+i*.49,'work',.38));
    selected(t,issue,true);
    if(detail){
      const k=t-(key==='clear'?31.90:11.86);
      camera.fov=key==='clear'?42:41;
      camera.position.set(key==='clear'?.48+k*.27:1.28-k*.34,1.70-k*.071,3.44-k*.155);
      camera.lookAt(.70,1.36,.88);
    }else{
      const k=t-(test?19.57:radio?26.34:15.58);
      camera.fov=radio?48:59;
      camera.position.set((test?-1.39:radio?.55:1.22)+k*(test?.54:-.46),1.94+k*.065,(radio?3.13:4.15)-k*.148);
      camera.lookAt(radio?-.30:.018,radio?1.76:1.70,.46);
    }
  }};
}
export function makeSwitch(){
  const scene=new T.Scene();scene.background=new T.Color(0x23445d);lighting(scene,0x89d0ff,0xffcc94,2.65);
  box(scene,7,5,.30,0,1.47,-1.82,0x3c6274);
  const window=windowView(scene,.53,2.24,-1.60,1.68,1.04);
  const port=new T.PointLight(0x45caff,18,5,1.65);port.position.set(.68,2.2,-.72);scene.add(port);
  const lamp=new T.PointLight(0xffa54b,10,2,1.74);lamp.position.set(-.51,1.38,.71);scene.add(lamp);
  const body=group(scene,.12,1.05,.38);
  box(body,2.13,1.26,.26,0,0,0,steel);
  box(body,1.66,.95,.035,-.04,.02,.148,0x6c8084);
  for(const x of [-.77,.69])for(const y of [-.38,.40])rivet(body,x,y,.182,.037);
  const bulb=led(body,-.58,.265,.19,.27,.17,0xffa125);
  label(body,'SCE POWER',.55,.095,.05,.374,.182);
  for(const [name,y] of [['NORMAL',.194],['OFF',.035],['AUX',-.139]]){
    label(body,name,.42,.084,.41,y,.182);
    box(body,.08,.011,.015,.207,y,.185,0xe3dfc8,true);
  }
  orb(body,-.06,.035,.205,.128,.151,.050,0x253640);
  orb(body,-.06,.035,.233,.094,.116,.028,0x9aa5a4);
  orb(body,-.06,.035,.253,.074,.089,.019,0x22343c);
  const anchor=vector(-.06,.035,.263);
  const toggle=rod(body,anchor,vector(-.06,.178,.49),.034,0xa3b3b6);
  const tip=orb(body,-.06,.178,.49,.041,.041,.042,0xe3ded2);
  const from=vector(-1.14,-.53,.78),elbow=vector(-.60,-.29,.69);
  const arm=rod(body,from,elbow,.020,ink,true);
  const fore=rod(body,elbow,vector(-.38,.00,.54),.020,ink,true);
  const fist=group(body);
  orb(fist,0,0,0,.105,.081,.045,ink,true);
  orb(fist,.008,.006,.026,.091,.066,.031,0xffffff,true);
  orb(fist,.068,-.035,.018,.057,.038,.032,ink,true);
  orb(fist,.068,-.032,.041,.045,.030,.024,0xffffff,true);
  const person=engineer(scene,{suit:true,variant:1});person.rig.position.set(-.61,1.85,-.40);person.rig.scale.setScalar(.76);
  return {scene,frame(t,camera,key,events) {
    const operation=key==='toggle';
    const flip=operation?ease((t-(events.toggle-.16))/.16):0;
const angle=.63-1.26*flip;
    const end=vector(-.06,.035+.288*Math.sin(angle),.263+.288*Math.cos(angle));
    aim(toggle,anchor,end,.034);tip.position.copy(end);
    const amount=operation?ease((t-29.58)/.85):0;
    const release=operation?ease((t-31.24)/.68):0;
    const hand=vector(-.72,-.47,.69).lerp(end.clone().add(vector(-.064,.032,.013)),amount*(1-release*.65));
    fist.position.copy(hand);fist.rotation.z=flip*-.45;
    const joint=elbow.clone().lerp(hand,.22);
    aim(arm,from,joint,.021);aim(fore,joint,hand,.021);arm.visible=fore.visible=fist.visible=operation;
    lamp.color.setHex(flip>.99?0x4ee393:0xff982d);lamp.intensity=8+Math.sin(t*4)*1.5;
    window.offset.set(Math.sin(t*.7)*.027,Math.sin(t*1.01)*.042);
    bulb.material.color.setHex(flip>.99?0x58d185:0xffa125);
    person.update(t,operation?(flip>.99?'relieved':'work'):'alarm',.45);
    const k=t-(operation?29.50:22.76);
    camera.fov=operation?51:50;
    camera.position.set((operation?-.40:.54)+k*(operation?.32:-.26),1.56-k*.069,3.04-k*.16);
    camera.lookAt(operation?.16:.22,1.30,.44);
  }};
}
