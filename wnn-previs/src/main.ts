import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const viewport = document.querySelector('#viewport') as HTMLElement;
const selectionLabel = document.querySelector('#selection') as HTMLElement;
const frameGuide = document.querySelector('#frameGuide') as HTMLElement;
const shotName = document.querySelector('#shotName') as HTMLElement;
const lightName = document.querySelector('#lightName') as HTMLElement;
const cameraButtons = document.querySelector('#cameraButtons') as HTMLElement;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
viewport.append(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#17130f');
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;

const transform = new TransformControls(camera, renderer.domElement);
transform.setMode('translate');
transform.setTranslationSnap(0.25);
transform.setRotationSnap(THREE.MathUtils.degToRad(15));
scene.add(transform.getHelper());
transform.addEventListener('dragging-changed', (event: any) => { orbit.enabled = !event.value; });

const ambient = new THREE.HemisphereLight('#f0d7b1', '#33261c', 1.15);
scene.add(ambient);
const key = new THREE.DirectionalLight('#ffdca0', 2.0);
key.position.set(5, 7, 6); key.castShadow = true; scene.add(key);
const practical = new THREE.PointLight('#ffb75f', 1.1, 9);
practical.position.set(-2.4, 2.2, -1.9); scene.add(practical);

const root = new THREE.Group(); root.name = 'wnn-shopfront'; scene.add(root);
const selectable = new Set<THREE.Object3D>();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let selected: THREE.Object3D | null = null;
let objectCounter = 0;
let activeCamera = 'MASTER';
let activeLight = 'NORMAL';
let activeAspect: '16:9' | '9:16' = '16:9';
let transition: { fromPos: THREE.Vector3; toPos: THREE.Vector3; fromTarget: THREE.Vector3; toTarget: THREE.Vector3; start: number; duration: number } | null = null;

const CAMERA_PRESETS = [
  ['MASTER', [7.6,4.1,8.6], [0,1.25,0.15], 42],
  ['HOST', [-2.0,1.7,3.0], [-1.05,1.25,0.15], 35],
  ['CO-ANCHOR', [2.0,1.7,3.0], [1.05,1.25,0.15], 35],
  ['TWO-SHOT', [0.15,1.8,3.7], [0,1.2,0.1], 40],
  ['WITNESS', [3.5,1.7,1.6], [2.25,1.15,-1.0], 36],
  ['HUNT', [-3.1,1.55,1.0], [0.7,1.15,0], 32],
  ['CRT', [2.7,1.75,-1.5], [2.55,1.7,-2.55], 30],
  ['VERTICAL', [-1.7,1.75,2.4], [-1.0,1.25,0.1], 30],
] as const;

function mat(color: string, roughness = 0.88) { return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.03 }); }
function box(name: string, size: [number,number,number], pos: [number,number,number], color: string, selectableFlag = false) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), mat(color));
  mesh.name = name; mesh.position.set(...pos); mesh.castShadow = true; mesh.receiveShadow = true; root.add(mesh);
  if (selectableFlag) register(mesh, name); return mesh;
}
function register(obj: THREE.Object3D, assetId: string) {
  obj.userData.kind = 'prop'; obj.userData.assetId = assetId; obj.userData.instanceId = `${assetId}-${++objectCounter}`; selectable.add(obj);
}
function actorProxy(name: string, x: number, z: number, color: string) {
  const group = new THREE.Group(); group.name = name;
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 1.05, 4, 8), mat(color)); body.position.y = 0.78; body.castShadow = true;
  group.add(body); group.position.set(x, 0, z); root.add(group); register(group, 'actor-proxy'); return group;
}

function slender(name: string, size: [number,number,number], pos: [number,number,number], color: string, parent: THREE.Group) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(...size), mat(color, .72));
  m.position.set(...pos); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}

function foldingChair(name: string, x: number, z: number, rotY = 0) {
  const g = new THREE.Group(); g.name = name;
  const wood = '#9a6433';
  // Thin slatted seat/back and crossed folding legs, closer to the shop chairs in the reference photos.
  for (let i = 0; i < 4; i++) slender(`${name}-seat-${i}`, [.105,.045,.48], [-.18 + i*.12,.50,0], wood, g);
  for (let i = 0; i < 4; i++) slender(`${name}-back-${i}`, [.105,.045,.46], [-.18 + i*.12,.79,.19], wood, g).rotation.x = -.10;
  const legA = slender(`${name}-leg-a`, [.055,.78,.055], [-.18,.28,0], '#6f4728', g); legA.rotation.z = -.28;
  const legB = slender(`${name}-leg-b`, [.055,.78,.055], [.18,.28,0], '#6f4728', g); legB.rotation.z = .28;
  const rearA = slender(`${name}-rear-a`, [.055,.82,.055], [-.18,.30,.15], '#6f4728', g); rearA.rotation.z = .24;
  const rearB = slender(`${name}-rear-b`, [.055,.82,.055], [.18,.30,.15], '#6f4728', g); rearB.rotation.z = -.24;
  g.position.set(x,0,z); g.rotation.y = rotY; root.add(g); register(g,'folding-chair'); return g;
}

function foldingTable() {
  const g = new THREE.Group(); g.name = 'folding-table';
  const wood = '#966032';
  // Narrow slatted top rather than one chunky slab.
  for (let i = 0; i < 8; i++) slender(`table-slat-${i}`, [.20,.055,1.0], [-.70 + i*.20,.72,.25], wood, g);
  const frameColor = '#6d4527';
  for (const x of [-.55,.55]) {
    const a = slender('table-leg', [.065,1.35,.065], [x,.34,.10], frameColor, g); a.rotation.z = x < 0 ? -.16 : .16;
    const b = slender('table-leg', [.065,1.35,.065], [x,.34,.40], frameColor, g); b.rotation.z = x < 0 ? .16 : -.16;
  }
  g.position.set(0,0,0); root.add(g); register(g,'folding-table'); return g;
}

function buildRoom() {
  root.clear(); selectable.clear(); transform.detach(); selected = null; objectCounter = 0; selectionLabel.textContent = 'Nothing selected';
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(11,9), mat('#5a5147')); floor.rotation.x = -Math.PI/2; floor.receiveShadow = true; root.add(floor);
  box('shop-back',[6.8,3.2,.12],[0,1.6,-3.0],'#896e53');
  box('shop-left',[.12,3.2,4.0],[-3.4,1.6,-1.0],'#8b7056');
  box('shop-right',[.12,3.2,4.0],[3.4,1.6,-1.0],'#8b7056');
  box('threshold',[7.0,.18,2.0],[0,.09,1.0],'#7b7065');

  box('counter',[2.8,1.0,.65],[-2.0,.5,-2.25],'#4d3828',true);
  for (let r=0;r<3;r++) box(`shelf-${r+1}`,[2.9,.08,.35],[-1.7,1.15+r*.55,-2.82],'#423329');
  for (let i=0;i<12;i++) { const b=box(`bottle-${i+1}`,[.11,.38,.11],[-2.85+(i%6)*.42,1.38+Math.floor(i/6)*.55,-2.62],i%3===0?'#2e4c3a':'#5c3827'); b.rotation.z=((i%5)-2)*.015; }
  for (const x of [-3.15,3.15]) for (let i=0;i<4;i++) box(`grille-${x}-${i}`,[.035,2.5,.035],[x,1.35,-1.6+i*.4],'#383838');

  foldingTable();
  foldingChair('wood-chair-a',-1.22,.78,.08);
  foldingChair('wood-chair-b',1.24,.72,-.10);
  foldingChair('wood-chair-c',.18,1.85,Math.PI);
  // Keep setup residue and stacked plastic seats; these were part of what made the reference feel real.
  for (let i=0;i<5;i++) box(`stacked-plastic-${i}`,[.58,.08,.58],[2.35,.25+i*.1,1.65],'#3e8a49');
  box('beer-crate',[.65,.48,.55],[-2.45,.24,1.8],'#76502e',true);
  box('broom-handle',[.05,1.7,.05],[2.7,.86,1.25],'#496b86');
  const broomHead=box('broom-head',[.65,.08,.16],[2.72,.08,1.25],'#3d6d42'); broomHead.rotation.y=.2;
  box('bucket',[.42,.48,.42],[2.0,.24,2.0],'#3b7850');

  box('crt',[1.35,.9,.32],[2.45,1.7,-2.68],'#252321',true);
  const screen = box('crt-screen',[1.0,.58,.03],[2.45,1.7,-2.50],'#6b5f46');
  screen.material = new THREE.MeshStandardMaterial({color:'#756b50',emissive:'#39311f',emissiveIntensity:.35});
  actorProxy('host-proxy',-1.05,.2,'#665443'); actorProxy('coanchor-proxy',1.05,.2,'#635041'); actorProxy('witness-proxy',2.25,-1.05,'#4d4b45');
  setCamera(activeCamera, false); setLighting(activeLight);
}

function select(obj: THREE.Object3D | null) {
  selected = obj; if (!obj) { transform.detach(); selectionLabel.textContent='Nothing selected'; return; }
  transform.attach(obj); selectionLabel.textContent=`${obj.name || obj.userData.assetId}`;
}
renderer.domElement.addEventListener('pointerdown',(event)=>{
  if ((transform as any).dragging) return;
  const rect=renderer.domElement.getBoundingClientRect(); pointer.x=((event.clientX-rect.left)/rect.width)*2-1; pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;
  raycaster.setFromCamera(pointer,camera); const hits=raycaster.intersectObjects(Array.from(selectable),true); if(!hits.length) return select(null);
  let obj:THREE.Object3D|null=hits[0].object; while(obj && !selectable.has(obj)) obj=obj.parent; select(obj);
});

function setCamera(id: string, animate = true) {
  const preset=CAMERA_PRESETS.find(([name])=>name===id) ?? CAMERA_PRESETS[0]; const [,pos,target,fov]=preset;
  activeCamera=preset[0]; shotName.textContent=activeCamera; camera.fov=fov; camera.updateProjectionMatrix();
  const toPos=new THREE.Vector3(...pos); const toTarget=new THREE.Vector3(...target);
  if (!animate) { camera.position.copy(toPos); orbit.target.copy(toTarget); return; }
  transition={fromPos:camera.position.clone(),toPos,fromTarget:orbit.target.clone(),toTarget,start:performance.now(),duration:550};
}
for (const [id] of CAMERA_PRESETS) {
  const b=document.createElement('button'); b.textContent=id; b.dataset.camera=id; if(id==='MASTER') b.classList.add('active');
  b.addEventListener('click',()=>{ document.querySelectorAll('[data-camera]').forEach(x=>x.classList.remove('active')); b.classList.add('active'); setCamera(id); if(id==='VERTICAL') setAspect('9:16'); }); cameraButtons.append(b);
}
function setLighting(id: string) {
  activeLight=id; lightName.textContent=id;
  if(id==='LONG_ONE'){renderer.toneMappingExposure=.86;ambient.intensity=.72;key.intensity=1.35;practical.intensity=1.45;}
  else if(id==='WITNESS_SHOCK'){renderer.toneMappingExposure=1.05;ambient.intensity=.55;key.intensity=2.4;practical.intensity=.65;}
  else {renderer.toneMappingExposure=1;ambient.intensity=1.15;key.intensity=2;practical.intensity=1.1;}
}
document.querySelectorAll<HTMLButtonElement>('[data-light]').forEach(b=>b.addEventListener('click',()=>{ document.querySelectorAll('[data-light]').forEach(x=>x.classList.remove('active')); b.classList.add('active'); setLighting(b.dataset.light || 'NORMAL'); }));
function setAspect(value:'16:9'|'9:16'){ activeAspect=value; frameGuide.classList.toggle('landscape',value==='16:9'); frameGuide.classList.toggle('portrait',value==='9:16'); document.querySelectorAll('[data-aspect]').forEach(x=>x.classList.toggle('active',(x as HTMLElement).dataset.aspect===value)); }
document.querySelectorAll<HTMLButtonElement>('[data-aspect]').forEach(b=>b.addEventListener('click',()=>setAspect((b.dataset.aspect||'16:9') as '16:9'|'9:16')));
document.querySelectorAll<HTMLButtonElement>('[data-transform]').forEach(button=>button.addEventListener('click',()=>{ transform.setMode(button.dataset.transform as 'translate'|'rotate'|'scale'); document.querySelectorAll('[data-transform]').forEach(b=>b.classList.remove('active')); button.classList.add('active'); }));

function snapshot(){return {camera:activeCamera,light:activeLight,aspect:activeAspect,objects:Array.from(selectable).map(obj=>({id:obj.userData.instanceId,name:obj.name,position:obj.position.toArray(),rotation:[obj.rotation.x,obj.rotation.y,obj.rotation.z],scale:obj.scale.toArray()}))};}
function saveScene(){localStorage.setItem('wnn-previs-v0',JSON.stringify(snapshot()));selectionLabel.textContent='Saved in this browser';}
function loadScene(){const raw=localStorage.getItem('wnn-previs-v0');if(!raw)return;const data=JSON.parse(raw);for(const state of data.objects||[]){const obj=Array.from(selectable).find(x=>x.userData.instanceId===state.id||x.name===state.name);if(!obj)continue;obj.position.fromArray(state.position);obj.rotation.set(state.rotation[0],state.rotation[1],state.rotation[2]);obj.scale.fromArray(state.scale);}setLighting(data.light||'NORMAL');setAspect(data.aspect||'16:9');setCamera(data.camera||'MASTER',false);selectionLabel.textContent='Scene loaded';}
document.querySelector('#saveScene')?.addEventListener('click',saveScene); document.querySelector('#loadScene')?.addEventListener('click',loadScene); document.querySelector('#resetScene')?.addEventListener('click',buildRoom);

const loader=new GLTFLoader(); const modelInput=document.querySelector('#modelInput') as HTMLInputElement;
modelInput.addEventListener('change',async()=>{ const file=modelInput.files?.[0]; if(!file)return; const url=URL.createObjectURL(file); try{const gltf=await loader.loadAsync(url);const obj=gltf.scene;obj.name=file.name;register(obj,file.name);obj.position.set(0,0,2.1);obj.traverse((child:any)=>{if(child.isMesh){child.castShadow=true;child.receiveShadow=true;}});root.add(obj);select(obj);}finally{URL.revokeObjectURL(url);modelInput.value='';} });
function resize(){const{clientWidth,clientHeight}=viewport;camera.aspect=clientWidth/Math.max(clientHeight,1);camera.updateProjectionMatrix();renderer.setSize(clientWidth,clientHeight,false);}
window.addEventListener('resize',resize);

buildRoom(); resize(); setAspect('16:9');
function tick(){
  if(transition){const t=Math.min(1,(performance.now()-transition.start)/transition.duration);const e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;camera.position.lerpVectors(transition.fromPos,transition.toPos,e);orbit.target.lerpVectors(transition.fromTarget,transition.toTarget,e);if(t>=1)transition=null;}
  orbit.update(); renderer.render(scene,camera); requestAnimationFrame(tick);
}
tick();
