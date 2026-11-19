
import * as T from './lib/three.module.js';
import {aim, box, group, label, lighting, mat, mesh, orb, rng, rod, vector} from './paint.js';

function makeSky(storm) {
  const canvas=document.createElement('canvas'); canvas.width=768; canvas.height=768;
  const ctx=canvas.getContext('2d'), im=ctx.createImageData(768,768);
  const random=rng(840);
  const grids=Array.from({length:7},(_,i)=>{
    const n=5*(2**i)+2; return {n,values:Float32Array.from({length:n*n},random)};
  });
  const interp=(a,b,t)=>a+(b-a)*t;
  const noise=(x,y,{n,values})=>{
    const px=x*(n-2),py=y*(n-2), i=Math.floor(px),j=Math.floor(py);
    const f=px-i,g=py-j,s=f*f*(3-2*f),t=g*g*(3-2*g);
    return interp(interp(values[j*n+i],values[j*n+i+1],s),interp(values[(j+1)*n+i],values[(j+1)*n+i+1],s),t);
  };
  for(let y=0;y<768;y++) for(let x=0;x<768;x++){
    const u=x/768,v=y/768, k=4*(y*768+x);
    let f=0,a=.58;
    for(const g of grids){ f+=a*noise(u,v,g); a*=.53; }
    const edge=Math.max(0, Math.min(1,(f-(storm?.48:.56))*6));
    const light=Math.max(0,Math.min(1,.41+(f-noise(Math.max(0,u-.017),Math.max(0,v-.024),grids[0]))*1.15));
    const blue=storm?[12+v*24,39+v*44,78+v*63]:[29+v*79,100+v*71,187+v*54];
    const cloud=storm?[39+light*120,66+light*121,117+light*107]:[124+light*124,164+light*89,204+light*51];
    for(let c=0;c<3;c++) im.data[k+c]=interp(blue[c],cloud[c],edge);
    im.data[k+3]=255;
  }
  ctx.putImageData(im,0,0);
  const tex=new T.CanvasTexture(canvas); tex.colorSpace=T.SRGBColorSpace; return tex;
}
export const skies = {ground:makeSky(false), storm:makeSky(true)};
function skyCard(scene, map, w,h,x,y,z) {
  return mesh(scene,new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,fog:false}),x,y,z);
}
function lathe(parent,points,color){
  return mesh(parent,new T.LatheGeometry(points.map(([r,y])=>new T.Vector2(r,y)),48),mat(color));
}
function nozzle(parent,x,z,scale){
  const g=group(parent,x,.32,z); g.scale.setScalar(scale);
  lathe(g,[[.065,.12],[.076,.02],[.107,-.12],[.171,-.30],[.17,-.33],[.145,-.33],[.05,.12]],0x253747);
}
function airframe(parent) {
  const rocket=group(parent);
  lathe(rocket,[[0,.30],[.43,.31],[.49,.52],[.49,3.70],[.44,3.77],[.44,5.18],[.29,5.69],[.29,6.28],[.23,6.62],[.06,6.90],[.02,6.98],[0,7]],0xf4eee1);
  for (const [y,h,r] of [[.64,.29,.496],[3.51,.21,.495],[3.84,.20,.445],[5.20,.15,.442],[6.48,.08,.27]]){
    mesh(rocket,new T.CylinderGeometry(r,r,h,48,1,true),mat(0x252b33),0,y,0);
  }
  for(let j=0;j<4;j++){
    const angle=j*Math.PI/2;
    const sector=group(rocket); sector.rotation.y=angle;
    box(sector,.29,.94,.018,0,1.03,.487,0x232731);
    box(sector,.27,.61,.018,0,3.31,.488,0x20252a);
    box(sector,.18,.42,.038,0,.50,.486,0x697681);
    box(sector,.085,2.03,.067,.22,2.40,.434,0xe8e4d9);
    const country=label(sector,'USA',.37,.20,0,2.60,.498,{color:'#a72524'}); country.rotation.z=Math.PI/2;
  }
  for(let j=0;j<47;j++){
    const a=j*Math.PI*2/47;
    box(rocket,.015,.32,.015,Math.sin(a)*.496,3.72,Math.cos(a)*.496,0xc3c9c4);
  }
  nozzle(rocket,0,0,1);
  for(const [x,z] of [[-.22,0],[.22,0],[0,-.22],[0,.22]]) nozzle(rocket,x,z,.80);
  rod(rocket,vector(0,6.84,0),vector(0,7.40,0),.045,0xebebe2);
  lathe(rocket,[[.044,7.39],[0,7.64]],0xf5eee4);
  return rocket;
}
function glow(){
  const c=document.createElement('canvas'); c.width=c.height=128; const p=c.getContext('2d');
  const g=p.createRadialGradient(64,64,2,64,64,63);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,248,.98)');g.addColorStop(.65,'rgba(255,244,211,.43)');g.addColorStop(1,'rgba(255,244,211,0)');
  p.fillStyle=g;p.fillRect(0,0,128,128);return new T.CanvasTexture(c);
}
const particleMap=glow();
function vapourMap() {
  const c=document.createElement('canvas');c.width=c.height=128;
  const p=c.getContext('2d'),r=rng(943);
  for(let j=0;j<48;j++){
    const a=r()*Math.PI*2,d=r()*44,x=64+Math.cos(a)*d,y=64+Math.sin(a)*d*.72;
    const radius=13+r()*19;
    const g=p.createRadialGradient(x,y,1,x,y,radius);
    g.addColorStop(0,'rgba(255,252,239,.27)');g.addColorStop(.60,'rgba(209,226,250,.19)');g.addColorStop(1,'rgba(142,179,222,0)');
    p.fillStyle=g;p.fillRect(x-radius,y-radius,radius*2,radius*2);
  }
  return new T.CanvasTexture(c);
}
const cloudMap=vapourMap();
function movingClouds(scene,seed,storm) {
  const random=rng(seed), puffs=[];
  for(let j=0;j<(storm?46:28);j++){
    const d=random(),a=random()-.5;
    const x=storm?Math.sign(a)*(4.5+Math.abs(a)*32):a*86;
    const y=storm?-.9+random()*17:4+random()*21,z=(storm?-22:-39)+d*(storm?27:18);
    const s=2.8+random()*(storm?6.5:9);
    const sprite=new T.Sprite(new T.SpriteMaterial({map:cloudMap,color:storm?(j%3?0x73b0e6:0xbabdee):0xf9eee0, transparent:true, depthWrite:false, opacity:.48}));
    scene.add(sprite);puffs.push({sprite,x,y,z,s,d});
  }
  return (t, flash=0)=>{
    for(const {sprite,x,y,z,s,d} of puffs){
      sprite.position.set(x+t*(d*.7+.26),y+(storm?-t*(.48+d*.63):t*.23),z);
      sprite.scale.set(s*1.65,s,1);sprite.material.rotation=.22*Math.sin(t*.3+d*6)+d*1.1;
      sprite.material.opacity=(storm?.20:.24)+.22*d+flash*.18;
    }
  };
}
function landCover(scene,r) {
  for(let j=0;j<40;j++){
    const x=(r()-.5)*30,z=2.5+r()*9,size=.3+r()*1.3;
    for(let i=0;i<4;i++){
      const p=orb(scene,x+(r()-.5)*size,.02+r()*.22,z+(r()-.5)*size,.22+size*r()*.53,.12+r()*.23,.22+size*r()*.50,
        [0x425f26,0x548027,0x709b38,0x2d572e][i]);
      p.rotation.y=r()*3;
    }
  }
}
function exhaust(rocket,count=24){
  const random=rng(72), particles=[];
  const core=lathe(rocket,[[0,-3.2],[.10,-2.1],[.24,-.73],[.36,-.05],[.34,.20],[0,.21]],0xffde62);
  const plume=new T.ShaderMaterial({
    transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,
    uniforms:{ticks:{value:0}},
    vertexShader:'varying vec3 v; void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`varying vec3 v; uniform float ticks;
      void main(){
        float y=clamp(-v.y/3.2,0.,1.);
        float w=sin(v.y*24.+ticks*38.+sin(v.x*37.))*sin(v.y*39.-ticks*31.+v.z*72.);
        vec3 col=mix(vec3(1.,.95,.66),vec3(1.,.30,.025),smoothstep(.05,.76,y));
        float power=(1.-smoothstep(.39,1.,y))*(.71+.29*w);
        gl_FragColor=vec4(col,power*.77);
      }`
  });
  core.material=plume;
  const inner=lathe(rocket,[[0,-1.9],[.096,-1.2],[.23,-.10],[.27,.21],[0,.21]],0xfff5c0);
  inner.material=new T.MeshBasicMaterial({color:0xfff5bc,toneMapped:false});
  for(let j=0;j<count;j++) {
    const a=random()*6.283, r=random(), offset=random();
    const sprite=new T.Sprite(new T.SpriteMaterial({map:particleMap,color:j%3===0?0xfff4aa:0xff8122,
      depthWrite:false,transparent:true,blending:T.AdditiveBlending}));
    rocket.add(sprite); particles.push({sprite,a,r,offset});
  }
  return t=>{
    plume.uniforms.ticks.value=t;
    core.scale.y=.9+.11*Math.sin(t*43)+.07*Math.cos(t*32);
    inner.scale.y=1+.11*Math.cos(t*51);
    for(const {sprite,a,r,offset} of particles){
      const k=(t*1.8+offset)%1, radius=.19+(k*k)*.41;
      sprite.position.set(Math.cos(a)*r*radius,-.05-k*4.0,Math.sin(a)*r*radius);
      sprite.scale.set(.40+.95*k,.72+1.0*k,1);sprite.material.opacity=(1-k)*.65;
    }
  };
}
function tower(scene){
  const steel=0xc63922, dark=0x993527;
  const g=group(scene,-2.4,0,-.96);
  box(g,1.52,.21,1.2,0,.14,0,0x717785);
  for(const i of [-.48,.48]) for(const j of [-.39,.39]) box(g,.11,6.7,.11,i,3.45,j,steel);
  for(let n=0;n<12;n++){
    const y=.34+.53*n;
    box(g,1.1,.09,.88,0,y,0,steel);
    for(const z of [-.39,.39]) rod(g,vector(-.5,y,z),vector(.5,y+.51,z),.030,n%2?dark:steel);
    for(const x of [-.48,.48]) rod(g,vector(x,y,-.41),vector(x,y+.51,.41),.032,dark);
    if(n===3||n===6||n===9||n===11){
      box(g,1.54,.12,.29,.81,y+.13,.24,steel);
      rod(g,vector(.05,y-.18,.24),vector(1.42,y+.11,.24),.041,dark);
      box(g,.50,.16,.42,-.09,y+.18,0,0xf1b94d);
    }
  }
  rod(g,vector(0,6.8,0),vector(0,7.58,0),.034,steel);
}
function tuft(scene,r,x,z,size){
  const base=group(scene,x,-.15,z);
  const color=[0x567d25,0x6b9d32,0xa1b73d,0x325c2f,0x79a430];
  for(let j=0;j<7;j++){
    const a=j*.9+r()*.6; const length=size*(.55+r()*.65);
    const b=vector(Math.cos(a)*length*.74,length*(.49+r()*.51),Math.sin(a)*length*.74);
    const middle=vector(b.x*.46,b.y*.77,b.z*.46);
    const normal=vector(-Math.sin(a),0,Math.cos(a)).multiplyScalar(size*.10);
    const points=[0,0,0, ...middle.clone().add(normal).toArray(), ...b.toArray(),
      0,0,0, ...b.toArray(), ...middle.clone().sub(normal).toArray()];
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(points,3));geo.computeVertexNormals();
    const leaf=mat(color[j%5]).clone();leaf.side=T.DoubleSide;
    mesh(base,geo,leaf);
    rod(base,vector(0,0,0),middle,size*.009,0x9da93d);
    rod(base,middle,b,size*.006,0x8e9c42);
  }
  return {base,phase:r()*6.283};
}
export function makeLaunch(){
  const scene=new T.Scene(); scene.fog=new T.FogExp2(0x76b2c6,.015);
  lighting(scene,0x9bcfff,0xffe3b3,3.0);
  const sky=skyCard(scene,skies.ground,170,126,0,36,-57);
  const weather=movingClouds(scene,832,false);
  box(scene,240,.35,140,0,-.55,-24,0x4c7735);
  box(scene,60,.06,5.1,0,-.36,4.4,0x228b9b);
  const ripples=[];
  for(let j=0;j<41;j++){
    const gx=-13+(j*17%97)*.27,gz=2.29+(j*41%101)*.040;
    const ripple=box(scene,.17+(j%5)*.17,.008,.023,gx,-.318,gz,j%4===0?0x83d5d4:0x49a7ad);
    ripples.push({ripple,gx,gz});
  }
  box(scene,12,.56,5,0,-.11,0,0x687787);
  box(scene,7,.29,3.5,-.15,.15,-.35,0x525e66);
  for(let j=0;j<20;j++) box(scene,.08,.27,.08,-5+j*.51,.20,2.22,0xa1a686);
  box(scene,10.0,.044,.045,-.16,.35,2.22,0xb2ad80);
  tower(scene);
  const r=rng(144);
  const leaves=Array.from({length:30},()=>tuft(scene,r,(r()-.5)*24,7.3+r()*6,.22+r()*1.11));
  landCover(scene,r);
  for(let j=0;j<17;j++) orb(scene,(r()-.5)*96,.28,-15-r()*20,1.7+r()*2.5,.7+r()*.8,1.5,0x4e7435);
  const vehicle=airframe(scene), burn=exhaust(vehicle);
  const smoke=[];const fireLight=new T.PointLight(0xff942c,20,8,1.85);scene.add(fireLight);
  for(let i=0;i<32;i++){
    const sprite=new T.Sprite(new T.SpriteMaterial({map:cloudMap,color:i%4?0xc7b9a8:0xffc98b, depthWrite:false,opacity:.31}));
    scene.add(sprite);smoke.push({s:sprite,dx:(r()-.50)*2, dz:(r()-.50)*1.32,p:r(),ry:r()});
  }
  return {scene,frame(t,camera) {
    vehicle.position.set(.35,.69+t*.56+t*t*.22,0);burn(t);
    const thrust=new T.Vector3(.35,vehicle.position.y-.56,0);
    fireLight.position.copy(thrust);fireLight.intensity=38+9*Math.sin(t*29);
    weather(t);
    for(const {base,phase} of leaves){base.rotation.z=.10*Math.sin(t*3.4+phase);base.rotation.x=.071*Math.cos(t*2.3+phase);}
    for(const [j,{ripple,gx,gz}] of ripples.entries()){
      ripple.position.x=gx+.15*Math.sin(t*2+j);
      ripple.position.z=gz+.19*Math.sin(t*1.7+j*.77);
      ripple.scale.x=.65+.32*Math.sin(t*1.8+j);
    }
    for(const {s,dx,dz,p,ry} of smoke){
      s.position.set(.35+dx*(.65+t*.82)*(p+.33),.39+ry*.69+p*t*.58,dz*(1+t*.9));
      s.scale.set(.86+ry*.68+p*t*1.8,.73+ry*.58+p*t*1.23,1);s.material.opacity=.34+ry*.24;
    }
    camera.fov=45;
    camera.position.set(3.8-t*1.10,1.35+t*.32,15.15-t*.69);
    camera.lookAt(-.55+t*.21,4.08+t*.75,.10);
    sky.position.x=-t*.8;
  }};
}
function bolt(scene,start,end,seed) {
  const random=rng(seed),g=group(scene);
  function branch(a,b,n,wiggle,r){
    let last=a;
    for(let i=1;i<=n;i++){
      const p=a.clone().lerp(b,i/n);
      if(i!==n){p.x+=(random()-.5)*wiggle;p.y+=(random()-.5)*wiggle*.5;}
      rod(g,last,p,r,0xb7efff,true);rod(g,last,p,r*.43,0xffffff,true);last=p;
    }
  }
  branch(start,end,16,.65,.052);
  branch(start.clone().lerp(end,.46),start.clone().lerp(end,.48).add(vector(-1.6,-.75,0)),6,.42,.024);
  branch(start.clone().lerp(end,.68),start.clone().lerp(end,.78).add(vector(1.6,.6,0)),7,.45,.025);
  return g;
}
export function makeStorm(){
  const scene=new T.Scene();lighting(scene,0x96c8ff,0xffeee4,2.15);
  const sky=skyCard(scene,skies.storm,80,78,0,7,-32);
  const weather=movingClouds(scene,12376,true);
  const vehicle=airframe(scene),burn=exhaust(vehicle,20);
  const first=bolt(vehicle,vector(4.7,8.93,-1),vector(.1,6.81,.21),93);
  const plume=bolt(vehicle,vector(-.06,-2.3,.2),vector(-3.82,-9.4,.4),161);
  const second=bolt(vehicle,vector(-4.95,7.72,0),vector(-.22,5.16,.31),48);
  const cloudLight=new T.DirectionalLight(0x9bd5ff,0); cloudLight.position.set(4,7,4);scene.add(cloudLight);
  return {scene,frame(t,camera,angle,events){
    const secondShot=angle===1;
    vehicle.rotation.z=secondShot?-.27:-.13;
    vehicle.position.set(secondShot?.50-(t-5.03)*.30:.14+(t-2.66)*.19, .18*Math.sin(t*1.3),0);
    first.visible=t>=events.first&&t<events.first+.23;
    plume.visible=first.visible;
    second.visible=t>=events.second&&t<events.second+.22;
    cloudLight.intensity=first.visible||second.visible?3.6:0;
    const local=t-(secondShot?5.03:2.66);
    weather(t,first.visible||second.visible?1:0);
    burn(t);
    sky.position.x=(secondShot?-3:2)+local*.64;
    sky.position.y=5-local*.60;
    camera.fov=secondShot?44:47;
    const strike=(first.visible||second.visible)?.065*Math.sin(t*143):0;
    camera.position.set((secondShot?-3.75:3.47)+(secondShot?1.3:-1.18)*local+strike,secondShot?3.1+local*.82:3.91+local*.42,14.25-local*1.03);
    camera.lookAt(secondShot?.08:.08,3.94+local*.37,0);
  }};
}
