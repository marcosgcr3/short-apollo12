
import * as T from './lib/three.module.js';
import {RoundedBoxGeometry} from './lib/RoundedBoxGeometry.js';
const materials = new Map();
const boxes = new Map();
const cylinder = new T.CylinderGeometry(1, 1, 1, 12);
const sphere = new T.SphereGeometry(1, 18, 12);
export const vector = (x,y,z) => new T.Vector3(x,y,z);
export function rng(seed) {
  return () => ((seed = (Math.imul(1664525, seed) + 1013904223) >>> 0) / 4294967296);
}
function surface() {
  const c=document.createElement('canvas');c.width=c.height=192;
  const ctx=c.getContext('2d'),im=ctx.createImageData(192,192),r=rng(77);
  for(let y=0;y<192;y++)for(let x=0;x<192;x++){
    const k=(y*192+x)*4;
    const grain=234+12*r()-4*Math.sin(x*.58)*Math.sin(y*.37)-5*Math.cos(y*.59);
    im.data.set([grain,grain,grain,255],k);
  }
  ctx.putImageData(im,0,0);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;
  return tex;
}
const tex=surface();
export function mat(color, plain=false) {
  const key = color + ':' + plain;
  if(!materials.has(key)) materials.set(key, plain ? new T.MeshBasicMaterial({color,toneMapped:false}) : new T.MeshStandardMaterial({color,map:tex,roughness:.52,metalness:.08}));
  return materials.get(key);
}
export function mesh(parent, geom, material, x=0, y=0, z=0) {
  const item = new T.Mesh(geom, material); item.position.set(x,y,z); parent.add(item); return item;
}
export function group(parent,x=0,y=0,z=0) {
  const obj = new T.Group(); obj.position.set(x,y,z); parent.add(obj); return obj;
}
export function box(parent,w,h,d,x,y,z,color,plain=false) {
  const key = [w,h,d].join(',');
  if(!boxes.has(key)){
    const minimum=Math.min(w,h,d);
    boxes.set(key,minimum>.055?new RoundedBoxGeometry(w,h,d,2,Math.min(.038,minimum*.24)):new T.BoxGeometry(w,h,d));
  }
  return mesh(parent,boxes.get(key),mat(color,plain),x,y,z);
}
export function orb(parent,x,y,z,sx,sy,sz,color,plain=false) {
  const obj = mesh(parent,sphere,mat(color,plain),x,y,z); obj.scale.set(sx,sy,sz); return obj;
}
export function rod(parent,a,b,r,color,plain=false) {
  const obj = mesh(parent,cylinder,mat(color,plain)); aim(obj,a,b,r); return obj;
}
export function aim(obj,a,b,r) {
  const delta = b.clone().sub(a);
  obj.position.copy(a).lerp(b,.5);
  obj.scale.set(r,delta.length(),r);
  obj.quaternion.setFromUnitVectors(vector(0,1,0),delta.normalize());
}
export function label(parent,text,w,h,x,y,z,options={}) {
  const canvas = document.createElement('canvas');
  canvas.height=128; canvas.width=Math.max(128,Math.round(w/h*128));
  const ctx=canvas.getContext('2d');
  ctx.font='800 81px Arial'; ctx.fillStyle=options.color || '#f8f4e8'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(text,canvas.width/2,65,canvas.width-7);
  const texture=new T.CanvasTexture(canvas); texture.colorSpace=T.SRGBColorSpace;
  const item=mesh(parent,new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:T.DoubleSide}),x,y,z);
  return item;
}
export function lighting(scene,color,keyColor=0xffe3bd,intensity=2.8) {
  scene.add(new T.HemisphereLight(color,0x334363,1.43));
  const key=new T.DirectionalLight(keyColor,intensity); key.position.set(-3,6,5); scene.add(key);
  const rim=new T.DirectionalLight(0x57abff,2.1); rim.position.set(5,2,-3); scene.add(rim);
}
export function screenMaterial(map) {
  return new T.MeshBasicMaterial({map});
}
export function shape(parent, points, color,z=0) {
  const path=new T.Shape(points.map(([x,y])=>new T.Vector2(x,y)));
  return mesh(parent,new T.ShapeGeometry(path),mat(color),0,0,z);
}
