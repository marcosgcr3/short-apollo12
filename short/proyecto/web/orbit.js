
import * as T from './lib/three.module.js';
import {box, group, label, mesh, rng, rod, vector} from './paint.js';

const planetPath='./art/orbita/';
const sunDirection=vector(-.65,.43,.76).normalize();
const skin=new T.MeshStandardMaterial({color:0xeee9dc,roughness:.40,metalness:.23});
const alloy=new T.MeshStandardMaterial({color:0x8f9baa,roughness:.37,metalness:.28});
const charcoal=new T.MeshStandardMaterial({color:0x293345,roughness:.53,metalness:.16});
const heat=new T.MeshStandardMaterial({color:0x665449,roughness:.59,metalness:.18});
const gold=new T.MeshStandardMaterial({color:0xc99643,roughness:.47,metalness:.23});

function lathe(parent, profile, material){
  return mesh(parent,new T.LatheGeometry(profile.map(([r,y])=>new T.Vector2(r,y)),72),material);
}
function ring(parent,y,r,width,tone){
  const ringMesh=mesh(parent,new T.TorusGeometry(r,width,10,64),tone,0,y,0);
  ringMesh.rotation.x=Math.PI*.5;
}
function radiusDetails(parent,r,y,length,count,material){
  const bar=new T.BoxGeometry(.021,length,.022);
  for(let i=0;i<count;i++){
    const angle=i*Math.PI*2/count;
    const piece=mesh(parent,bar,material,Math.sin(angle)*r,y,Math.cos(angle)*r);
    piece.rotation.y=angle;
  }
}
function bodyPanel(parent,angle,x,y,w,h,r,material){
  const panel=group(parent);panel.rotation.y=angle;
  mesh(panel,new T.BoxGeometry(w,h,.013),material,x,y,r);
}
function apollo(scene){
  const vehicle=group(scene);
  const stage=[
    [.00,-1.78],[.44,-1.78],[.53,-1.71],[.58,-1.50],[.58,.56],[.56,.68],[.47,.77],[.34,1.29],[.00,1.30]
  ];
  lathe(vehicle,stage,skin);
  lathe(vehicle,[[.165,-1.50],[.195,-1.65],[.19,-1.74],[.26,-1.97],[.34,-2.20],[.38,-2.38],[.381,-2.42],[.344,-2.42],[.21,-2.09],[.137,-1.73]].reverse(),heat);
  for(const [y,r,thick] of [[-2.36,.372,.016],[-2.26,.354,.013],[-2.16,.321,.011],[-2.04,.282,.012],[-1.83,.228,.011]]){
    ring(vehicle,y,r,thick,charcoal);
  }
  lathe(vehicle,[[.571,-1.52],[.582,-1.49],[.583,-1.13],[.579,-1.10]],charcoal);
  radiusDetails(vehicle,.585,-1.315,.37,64,alloy);
  lathe(vehicle,[[.58,.50],[.584,.51],[.584,.69],[.559,.71]],charcoal);
  radiusDetails(vehicle,.581,.602,.15,64,alloy);
  for(const y of [-1.53,-1.11,-.62,.14,.54])ring(vehicle,y,.582,.009,alloy);
  for(let i=0;i<4;i++){
    const angle=i*Math.PI*.5;
    const side=group(vehicle);side.rotation.y=angle;
    bodyPanel(side,0,.125,-.84,.105,.25,.570,charcoal);
    bodyPanel(side,0,-.162,.63,.091,.17,.56,skin);
    bodyPanel(side,0,-.133,-.065,.032,.90,.569,alloy);
    const mark=label(side,'USA',.42,.117,0,.05,.586,{color:'#a03c34'});
    mark.rotation.z=Math.PI/2;
    for(let k=0;k<8;k++)box(side,.018,.018,.017,-.128,-.58+k*.157,.580,0x8c979d);
  }
  lathe(vehicle,[[.342,1.26],[.342,2.06],[.355,2.09],[.354,2.23],[.298,2.40],[.205,2.60],[.115,2.76],[.062,2.78],[.0,2.78]],skin);
  lathe(vehicle,[[.333,1.27],[.348,1.28],[.348,1.40],[.343,1.42]],charcoal);
  lathe(vehicle,[[.347,2.04],[.360,2.07],[.359,2.14],[.355,2.15]],alloy);
  for(let i=0;i<4;i++){
    const a=i*Math.PI*.5;
    const pod=group(vehicle);pod.rotation.y=a;
    box(pod,.145,.123,.070,0,1.925,.355,0xbecbd1);
    for(const x of [-.045,.045]){
      rod(pod,vector(x,1.916,.389),vector(x,1.891,.423),.022,0x3e4554);
      rod(pod,vector(x,1.933,.389),vector(x,1.965,.417),.022,0x3e4554);
    }
    bodyPanel(pod,0,.071,1.65,.067,.278,.336,alloy);
    const port=box(pod,.100,.061,.015,.047,2.370,.307,0x222a31);
    port.rotation.x=-.47;port.rotation.z=.12;
  }
  for(const angle of [1.07,3.12,5.2]){
    const strip=group(vehicle);strip.rotation.y=angle;
    rod(strip,vector(-.11,1.84,.339),vector(-.11,2.044,.338),.017,0xa2aab0);
  }
  ring(vehicle,2.736,.126,.009,charcoal);
  lathe(vehicle,[[.071,2.759],[.063,2.832],[.041,2.855],[0,2.857]],gold);
  return vehicle;
}

function starField(scene){
  const count=1500, data=new Float32Array(count*3), sizes=new Float32Array(count), colours=new Float32Array(count*3);
  const random=rng(179);
  for(let j=0;j<count;j++){
    const x=(random()-.5)*204,y=(random()-.5)*246,z=-28-random()*74, b=random();
    data.set([x,y,z],j*3);
    sizes[j]=.40+Math.pow(b,4)*3.5;
    colours.set([(.50+.50*b)*(j%3===0?.82:1),(.57+.43*b),(.69+.31*b)*(j%5===0?.80:1)],j*3);
  }
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.BufferAttribute(data,3));
  geometry.setAttribute('brightness',new T.BufferAttribute(colours,3));
  geometry.setAttribute('starSize',new T.BufferAttribute(sizes,1));
  const stars=new T.ShaderMaterial({
    transparent:true,depthWrite:false,blending:T.AdditiveBlending,
    vertexShader:`
      attribute vec3 brightness;attribute float starSize;varying vec3 glow;
      void main(){glow=brightness;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=starSize;}
    `,
    fragmentShader:`
      varying vec3 glow;
      void main(){float r=length(gl_PointCoord-.5)*2.;float a=pow(max(0.,1.-r),1.8);gl_FragColor=vec4(glow,a*.73);}
    `
  });
  scene.add(new T.Points(geometry,stars));
}
function atmosphere(scene,x,y,z,r){
  const atmosphereMaterial=new T.ShaderMaterial({
    transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.FrontSide,
    uniforms:{light:{value:sunDirection}},
    vertexShader:`
      varying vec3 point;varying vec3 surfaceNormal;
      void main(){vec4 world=modelMatrix*vec4(position,1.);point=world.xyz;surfaceNormal=normalize(mat3(modelMatrix)*normal);
      gl_Position=projectionMatrix*viewMatrix*world;}`,
    fragmentShader:`
      uniform vec3 light;varying vec3 point;varying vec3 surfaceNormal;
      void main(){vec3 n=normalize(surfaceNormal);vec3 eye=normalize(cameraPosition-point);
        float rim=pow(1.-clamp(dot(n,eye),0.,1.),4.8);
        float sun=smoothstep(-.27,.32,dot(n,light));vec3 col=mix(vec3(.055,.13,.55),vec3(.26,.72,1.),sun);
        gl_FragColor=vec4(col,rim*(.28+.66*sun));}`
  });
  mesh(scene,new T.SphereGeometry(r*1.008,144,88),atmosphereMaterial,x,y,z);
}
async function texture(name,srgb=true){
  const map=await new T.TextureLoader().loadAsync(planetPath+name);
  if(srgb)map.colorSpace=T.SRGBColorSpace;
  map.anisotropy=8;return map;
}

export async function makeOrbit(){
  const [land,cloudMap,moonMap]=await Promise.all([texture('tierra.jpg'),texture('nubes.jpg',false),texture('luna.jpg')]);
  const scene=new T.Scene();
  scene.background=new T.Color(0x030817);starField(scene);
  const sunshine=new T.DirectionalLight(0xffead0,3.2);
  sunshine.position.copy(sunDirection).multiplyScalar(24);scene.add(sunshine);
  scene.add(new T.HemisphereLight(0x9dcaff,0x2e385a,.62));
  const earthBounce=new T.DirectionalLight(0x439aff,.64);
  earthBounce.position.set(-9,-8,-2);scene.add(earthBounce);
  const center=vector(-3.70,-7.04,-9.0),radius=7.7;
  const earth=mesh(scene,new T.SphereGeometry(radius,144,88),new T.MeshStandardMaterial({
    map:land,roughness:.81,metalness:.01,emissive:0x123274,emissiveIntensity:.23
  }),...center.toArray());
  const clouds=mesh(scene,new T.SphereGeometry(radius*1.003,132,80),new T.MeshStandardMaterial({
    alphaMap:cloudMap,color:0xe8f3ff,transparent:true,depthWrite:false,opacity:.76,roughness:1
  }),...center.toArray());
  clouds.renderOrder=1;
  atmosphere(scene,...center.toArray(),radius);
  const moon=mesh(scene,new T.SphereGeometry(.68,72,44),new T.MeshStandardMaterial({
    map:moonMap,bumpMap:moonMap,bumpScale:.038,color:0xe0e4e6,roughness:1,emissive:0x15243f,emissiveIntensity:.15
  }),2.54,4.07,-9.6);
  const ship=apollo(scene);
  return {scene,frame(t,camera){
    const tau=Math.max(0,(t-37.43)/3.48);
    const travel=tau*.73+tau*tau*.27;
    earth.rotation.set(.115,.87+tau*.17,-.31);
    clouds.rotation.set(.115,.895+tau*.191,-.31);
    moon.rotation.set(.017,2.39+tau*.047,-.15);
    ship.position.set(-.74+travel*1.56,-.62+travel*1.31,.84-travel*6.64);
    ship.rotation.set(.16-travel*.16,.58+travel*.48,-1.03+travel*.19);
    ship.scale.setScalar(.65-travel*.08);
    camera.fov=44;
    camera.position.set(.72-travel*1.25,.34+travel*.37,9.2+travel*.82);
    camera.lookAt(.01+travel*.16,.32+travel*.14,-.25);
  }};
}
