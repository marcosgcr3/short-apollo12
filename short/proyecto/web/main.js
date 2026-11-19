
import * as T from './lib/three.module.js';
import {makeLaunch,makeStorm} from './exterior.js';
import {makeOrbit} from './orbit.js';
import {makeCabin,makeControl,makeSwitch} from './interior.js';
import {createPhotoStage} from './photo.js';
import {captions,events,fps,shots} from './story.js';
const params=new URLSearchParams(location.search);
const width=Number(params.get('width')||1080),height=Math.round(width*16/9);
const output=document.querySelector('#c');output.width=width;output.height=height;
const overlay=output.getContext('2d',{alpha:false});
const renderer=new T.WebGLRenderer({antialias:true, preserveDrawingBuffer:true, powerPreference:'high-performance'});
renderer.setSize(width,height,false);
renderer.outputColorSpace=T.SRGBColorSpace;
renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.14;
const camera=new T.PerspectiveCamera(39,width/height,.045,350);
const photo=params.get('style')==='photo'?await createPhotoStage(width,height):null;
const stages=photo?null:{launch:makeLaunch(),storm:makeStorm(),cabin:makeCabin(),control:makeControl(),mechanism:makeSwitch(),orbit:await makeOrbit()};
const gl=renderer.getContext(),dbg=gl.getExtension('WEBGL_debug_renderer_info');
console.log(dbg?gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER));
function subtitle(text,t) {
 const scale=width/1080;
 overlay.save();overlay.scale(scale,scale);
 overlay.font='900 61px Arial';overlay.textAlign='center';overlay.textBaseline='middle';
 if(overlay.measureText(text).width>910)overlay.font='900 '+Math.floor(61*910/overlay.measureText(text).width)+'px Arial';
 overlay.lineJoin='round';overlay.lineWidth=11;overlay.strokeStyle='#141319';
 overlay.shadowColor='rgba(0,0,0,.55)';overlay.shadowBlur=7;overlay.shadowOffsetY=4;
 overlay.strokeText(text,540,1470);overlay.shadowColor='transparent';
 overlay.fillStyle=t>=23.40&&t<24.44||t>=30.84&&t<31.44?'#ffde76':'#fffdf2';
 overlay.fillText(text,540,1470);
 overlay.restore();
}
window.renderFrame=(f,cover=false)=>{
 const t=f/fps;
 const shot=shots.findLast(s=>s[0]<=t);
 const [,set,key]=shot;
 overlay.fillStyle='#0a1423';overlay.fillRect(0,0,width,height);
 if(photo)photo.frame(overlay,t,set,key,events);else{
 const stage=stages[set];stage.frame(t,camera,key,events);
 camera.updateProjectionMatrix();
 renderer.render(stage.scene,camera);
 overlay.drawImage(renderer.domElement,0,0); }
 if(t===events.first||t===events.second){
   overlay.fillStyle='rgba(159,211,255,.13)';overlay.fillRect(0,0,width,height);
 }
 if(cover){
   const scale=width/1080;overlay.save();overlay.scale(scale,scale);overlay.textBaseline='middle';overlay.textAlign='center';
   overlay.lineJoin='round';overlay.lineWidth=19;overlay.strokeStyle='#10243a';
   overlay.font='900 131px Arial';overlay.strokeText('DOS RAYOS',540,1390);overlay.fillStyle='#fff4d7';overlay.fillText('DOS RAYOS',540,1390);
   overlay.font='900 83px Arial';overlay.lineWidth=14;overlay.strokeText('APOLO 12',540,1525);overlay.fillStyle='#ffc760';overlay.fillText('APOLO 12',540,1525);
   overlay.restore();
 }else{
   const text=captions.find(([a,b])=>t>=a&&t<b)?.[2];
   if(text)subtitle(text,t);
 }
};
window.renderFrame(0); window.ready=true;
