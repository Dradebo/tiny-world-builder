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
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;
viewport.append(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#c8c0b3');

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;
orbit.maxPolarAngle = Math.PI * 0.49;

const transform = new TransformControls(camera, renderer.domElement);
transform.setMode('translate');
transform.setTranslationSnap(0.05);
transform.setRotationSnap(THREE.MathUtils.degToRad(5));
scene.add(transform.getHelper());
transform.addEventListener('dragging-changed', (event: any) => { orbit.enabled = !event.value; });

const hemi = new THREE.HemisphereLight('#e8eef1', '#866f55', 0.78);
scene.add(hemi);

const sun = new THREE.DirectionalLight('#ffd7a1', 2.15);
sun.position.set(6.5, 8.5, 5.2);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -8;
sun.shadow.camera.right = 8;
sun.shadow.camera.top = 8;
sun.shadow.camera.bottom = -8;
sun.shadow.camera.near = 0.5;
sun.shadow.camera.far = 30;
scene.add(sun);

const interiorFill = new THREE.PointLight('#fff2dc', 0.35, 8);
interiorFill.position.set(0, 2.2, -2.5);
scene.add(interiorFill);

const root = new THREE.Group();
root.name = 'wnn-shopfront-rescue';
scene.add(root);

const selectable = new Set<THREE.Object3D>();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let selected: THREE.Object3D | null = null;
let objectCounter = 0;
let activeCamera = 'REF-SEATED';
let activeLight = 'SOURCE-DAY';
let activeAspect: '16:9' | '9:16' = '16:9';
let transition: { fromPos: THREE.Vector3; toPos: THREE.Vector3; fromTarget: THREE.Vector3; toTarget: THREE.Vector3; start: number; duration: number } | null = null;

const CAMERA_PRESETS = [
  ['REF-SEATED', [0.1, 1.28, 4.25], [0, 1.15, -0.75], 38],
  ['REF-STANDING', [0.35, 1.68, 4.7], [0, 1.22, -0.8], 40],
  ['MASTER', [5.6, 2.45, 6.4], [0, 1.2, -0.65], 40],
  ['HOST', [-2.15, 1.52, 2.6], [-0.9, 1.15, 0.0], 35],
  ['CO-ANCHOR', [2.15, 1.52, 2.6], [0.9, 1.15, 0.0], 35],
  ['TWO-SHOT', [0.05, 1.55, 3.35], [0, 1.15, -0.05], 38],
  ['WITNESS', [3.1, 1.52, 1.85], [0.15, 1.1, 1.25], 36],
  ['CRT', [2.8, 1.55, -0.95], [2.2, 1.55, -2.65], 32],
  ['VERTICAL', [-1.5, 1.55, 2.8], [-0.55, 1.12, -0.25], 32],
] as const;

function mat(color: string, roughness = 0.86, metalness = 0.02) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

const M = {
  paver: mat('#756f67', 0.96),
  tile: mat('#b0a79b', 0.9),
  wall: mat('#b99a78', 0.92),
  wallShadow: mat('#9b7f63', 0.94),
  metal: mat('#464746', 0.72, 0.18),
  wood: mat('#9a6636', 0.82),
  woodDark: mat('#6f4828', 0.86),
  counter: mat('#665244', 0.88),
  shelf: mat('#4d443d', 0.87),
  plasticGreen: mat('#3d8450', 0.8),
  plasticOrange: mat('#b85f32', 0.82),
  basketGreen: mat('#397955', 0.85),
  bottleGreen: mat('#31513a', 0.5, 0.03),
  bottleBrown: mat('#60412c', 0.52, 0.03),
  screen: new THREE.MeshStandardMaterial({ color: '#78705e', emissive: '#403725', emissiveIntensity: 0.36, roughness: 0.62 }),
};

function register(obj: THREE.Object3D, assetId: string) {
  obj.userData.kind = 'prop';
  obj.userData.assetId = assetId;
  obj.userData.instanceId = `${assetId}-${++objectCounter}`;
  selectable.add(obj);
}

function meshBox(name: string, size: [number, number, number], pos: [number, number, number], material: THREE.Material, parent = root, selectableFlag = false) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.name = name;
  mesh.position.set(...pos);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  if (selectableFlag) register(mesh, name);
  return mesh;
}

function slender(name: string, size: [number, number, number], pos: [number, number, number], material: THREE.Material, parent: THREE.Group) {
  return meshBox(name, size, pos, material, parent);
}

function paverField() {
  const g = new THREE.Group();
  g.name = 'forecourt-pavers';
  const geo = new THREE.CylinderGeometry(0.32, 0.32, 0.045, 6);
  for (let z = 0; z < 8; z++) {
    for (let x = -8; x <= 8; x++) {
      const p = new THREE.Mesh(geo, M.paver);
      p.rotation.y = Math.PI / 6;
      p.position.set(x * 0.54 + (z % 2 ? 0.27 : 0), -0.02, 0.55 + z * 0.47);
      p.receiveShadow = true;
      g.add(p);
    }
  }
  root.add(g);
  return g;
}

function foldingChair(name: string, x: number, z: number, rotY = 0, material = M.wood) {
  const g = new THREE.Group();
  g.name = name;
  for (let i = 0; i < 4; i++) slender(`${name}-seat-${i}`, [0.105, 0.045, 0.48], [-0.18 + i * 0.12, 0.46, 0], material, g);
  for (let i = 0; i < 4; i++) {
    const back = slender(`${name}-back-${i}`, [0.105, 0.045, 0.43], [-0.18 + i * 0.12, 0.76, 0.18], material, g);
    back.rotation.x = -0.10;
  }
  const legA = slender(`${name}-leg-a`, [0.055, 0.75, 0.055], [-0.18, 0.27, 0], M.woodDark, g); legA.rotation.z = -0.28;
  const legB = slender(`${name}-leg-b`, [0.055, 0.75, 0.055], [0.18, 0.27, 0], M.woodDark, g); legB.rotation.z = 0.28;
  const rearA = slender(`${name}-rear-a`, [0.055, 0.79, 0.055], [-0.18, 0.29, 0.15], M.woodDark, g); rearA.rotation.z = 0.24;
  const rearB = slender(`${name}-rear-b`, [0.055, 0.79, 0.055], [0.18, 0.29, 0.15], M.woodDark, g); rearB.rotation.z = -0.24;
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  root.add(g);
  register(g, 'folding-chair');
  return g;
}

function plasticChair(name: string, x: number, y: number, z: number, rotY = 0, material = M.plasticGreen, parent = root) {
  const g = new THREE.Group();
  g.name = name;
  meshBox(`${name}-seat`, [0.5, 0.08, 0.5], [0, 0.46, 0], material, g);
  const back = meshBox(`${name}-back`, [0.52, 0.55, 0.07], [0, 0.77, 0.19], material, g);
  back.rotation.x = -0.08;
  for (const sx of [-0.20, 0.20]) {
    for (const sz of [-0.18, 0.18]) {
      const leg = meshBox(`${name}-leg`, [0.055, 0.46, 0.055], [sx, 0.23, sz], material, g);
      leg.rotation.z = sx < 0 ? -0.035 : 0.035;
    }
  }
  g.position.set(x, y, z);
  g.rotation.y = rotY;
  parent.add(g);
  if (parent === root) register(g, 'plastic-chair');
  return g;
}

function stackedPlasticChairs() {
  const g = new THREE.Group();
  g.name = 'stacked-plastic-chairs';
  for (let i = 0; i < 5; i++) {
    const c = plasticChair(`stacked-chair-${i}`, 0, i * 0.055, 0, -0.03 * i, M.plasticGreen, g);
    c.position.z = i * 0.025;
  }
  g.position.set(2.55, 0, 1.55);
  g.rotation.y = -0.16;
  root.add(g);
  register(g, 'stacked-plastic-chairs');
  return g;
}

function foldingTable() {
  const g = new THREE.Group();
  g.name = 'folding-table';
  for (let i = 0; i < 8; i++) slender(`table-slat-${i}`, [0.20, 0.055, 1.0], [-0.70 + i * 0.20, 0.74, 0.15], M.wood, g);
  for (const x of [-0.55, 0.55]) {
    const a = slender('table-leg', [0.065, 1.32, 0.065], [x, 0.35, 0.02], M.woodDark, g); a.rotation.z = x < 0 ? -0.16 : 0.16;
    const b = slender('table-leg', [0.065, 1.32, 0.065], [x, 0.35, 0.30], M.woodDark, g); b.rotation.z = x < 0 ? 0.16 : -0.16;
  }
  g.position.set(0, 0, 0.7);
  g.rotation.y = -0.04;
  root.add(g);
  register(g, 'folding-table');
  return g;
}

function staticSeatedPerson(name: string, x: number, z: number, rotY: number, shirtColor: string) {
  const g = new THREE.Group();
  g.name = name;
  const skin = mat('#5d3f30', 0.9);
  const shirt = mat(shirtColor, 0.92);
  const trouser = mat('#383634', 0.94);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.20, 0.48, 4, 8), shirt); torso.position.y = 1.03; g.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), skin); head.position.y = 1.48; g.add(head);
  for (const sx of [-0.15, 0.15]) {
    const thigh = meshBox(`${name}-thigh`, [0.14, 0.14, 0.47], [sx, 0.62, 0.16], trouser, g); thigh.rotation.x = Math.PI / 2.3;
    const shin = meshBox(`${name}-shin`, [0.12, 0.46, 0.12], [sx, 0.37, 0.37], trouser, g); shin.rotation.x = -0.12;
    const arm = meshBox(`${name}-arm`, [0.11, 0.48, 0.11], [sx * 1.45, 1.02, 0.04], skin, g); arm.rotation.z = sx < 0 ? -0.22 : 0.22;
  }
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  root.add(g);
  register(g, 'static-person');
  return g;
}

function bottle(name: string, x: number, y: number, z: number, material = M.bottleBrown, parent = root) {
  const g = new THREE.Group();
  g.name = name;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.30, 10), material); body.position.y = 0.15; g.add(body);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.040, 0.13, 10), material); neck.position.y = 0.36; g.add(neck);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.015, 10), M.metal); cap.position.y = 0.435; g.add(cap);
  g.position.set(x, y, z);
  parent.add(g);
  return g;
}

function buildShopfrontShell() {
  paverField();
  meshBox('shop-interior-floor', [6.45, 0.11, 3.35], [0, 0.055, -1.55], M.tile);
  meshBox('threshold-step', [6.45, 0.20, 0.75], [0, 0.10, 0.25], M.tile);

  meshBox('shop-back', [6.45, 3.05, 0.13], [0, 1.525, -3.25], M.wallShadow);
  meshBox('left-return', [0.18, 3.05, 1.75], [-3.15, 1.525, -2.35], M.wall);
  meshBox('right-return', [0.18, 3.05, 1.75], [3.15, 1.525, -2.35], M.wall);

  for (const x of [-3.05, 3.05]) {
    meshBox(`front-column-${x}`, [0.30, 3.05, 0.30], [x, 1.525, -0.35], M.wall);
  }
  meshBox('shop-lintel', [6.35, 0.34, 0.28], [0, 2.88, -0.35], M.wall);

  // Thin open grille leaves: they frame the shop mouth without sealing it.
  for (const side of [-1, 1]) {
    const gx = side * 2.35;
    for (let i = 0; i < 5; i++) meshBox(`grille-${side}-${i}`, [0.035, 2.35, 0.035], [gx + side * i * 0.22, 1.30, -0.52], M.metal);
    meshBox(`grille-top-${side}`, [1.05, 0.035, 0.035], [side * 2.60, 2.47, -0.52], M.metal);
  }

  meshBox('counter', [2.65, 0.98, 0.70], [-1.72, 0.49, -2.30], M.counter, root, true);
  for (let r = 0; r < 3; r++) meshBox(`shelf-${r}`, [2.75, 0.075, 0.34], [-1.70, 1.18 + r * 0.55, -3.00], M.shelf);
  for (let i = 0; i < 15; i++) {
    bottle(`stock-bottle-${i}`, -2.72 + (i % 5) * 0.50, 1.20 + Math.floor(i / 5) * 0.55, -2.83, i % 3 === 0 ? M.bottleGreen : M.bottleBrown);
  }

  meshBox('crt-case', [1.25, 0.92, 0.38], [2.20, 1.67, -2.78], mat('#2d2b28', 0.8), root, true);
  meshBox('crt-screen', [0.92, 0.58, 0.035], [2.20, 1.67, -2.565], M.screen);
}

function addSetDressing() {
  foldingTable();
  foldingChair('wood-chair-host', -1.12, 0.86, 0.07);
  foldingChair('wood-chair-cohost', 1.15, 0.80, -0.12);
  foldingChair('wood-chair-witness', 0.20, 1.85, Math.PI - 0.05);
  plasticChair('green-chair-loose', 2.55, 0, 0.58, -0.24);
  stackedPlasticChairs();

  const crate = meshBox('beer-crate', [0.64, 0.44, 0.54], [-2.35, 0.22, 1.55], M.woodDark, root, true);
  for (let i = 0; i < 6; i++) bottle(`crate-bottle-${i}`, -0.20 + (i % 3) * 0.20, 0.22, -0.10 + Math.floor(i / 3) * 0.20, M.bottleBrown, crate as unknown as THREE.Group);

  const broom = new THREE.Group();
  broom.name = 'broom';
  const handle = meshBox('broom-handle', [0.045, 1.55, 0.045], [0, 0.78, 0], mat('#476883', 0.72), broom); handle.rotation.z = -0.12;
  const head = meshBox('broom-head', [0.60, 0.08, 0.18], [0.10, 0.06, 0], mat('#456f49', 0.95), broom); head.rotation.y = 0.15;
  broom.position.set(2.72, 0, 1.30); root.add(broom); register(broom, 'broom');

  const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.20, 0.43, 14, 1, true), M.basketGreen);
  bucket.name = 'bucket'; bucket.position.set(1.95, 0.22, 2.0); bucket.castShadow = true; root.add(bucket); register(bucket, 'bucket');

  bottle('table-bottle-a', -0.45, 0.78, 0.78, M.bottleBrown);
  bottle('table-bottle-b', 0.35, 0.78, 0.72, M.bottleGreen);

  staticSeatedPerson('host-proxy', -1.12, 0.86, Math.PI + 0.07, '#72503e');
  staticSeatedPerson('cohost-proxy', 1.15, 0.80, Math.PI - 0.12, '#465b4d');
  staticSeatedPerson('witness-proxy', 0.20, 1.85, -0.05, '#57524e');
}

function buildRoom() {
  root.clear();
  selectable.clear();
  transform.detach();
  selected = null;
  objectCounter = 0;
  selectionLabel.textContent = 'Nothing selected';
  buildShopfrontShell();
  addSetDressing();
  setCamera(activeCamera, false);
  setLighting(activeLight);
}

function select(obj: THREE.Object3D | null) {
  selected = obj;
  if (!obj) {
    transform.detach();
    selectionLabel.textContent = 'Nothing selected';
    return;
  }
  transform.attach(obj);
  selectionLabel.textContent = `${obj.name || obj.userData.assetId}`;
}

renderer.domElement.addEventListener('pointerdown', (event) => {
  if ((transform as any).dragging) return;
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(Array.from(selectable), true);
  if (!hits.length) return select(null);
  let obj: THREE.Object3D | null = hits[0].object;
  while (obj && !selectable.has(obj)) obj = obj.parent;
  select(obj);
});

function setCamera(id: string, animate = true) {
  const preset = CAMERA_PRESETS.find(([name]) => name === id) ?? CAMERA_PRESETS[0];
  const [, pos, target, fov] = preset;
  activeCamera = preset[0];
  shotName.textContent = activeCamera;
  camera.fov = fov;
  camera.updateProjectionMatrix();
  const toPos = new THREE.Vector3(...pos);
  const toTarget = new THREE.Vector3(...target);
  if (!animate) {
    camera.position.copy(toPos);
    orbit.target.copy(toTarget);
    return;
  }
  transition = { fromPos: camera.position.clone(), toPos, fromTarget: orbit.target.clone(), toTarget, start: performance.now(), duration: 520 };
}

for (const [id] of CAMERA_PRESETS) {
  const b = document.createElement('button');
  b.textContent = id;
  b.dataset.camera = id;
  if (id === activeCamera) b.classList.add('active');
  b.addEventListener('click', () => {
    document.querySelectorAll('[data-camera]').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    setCamera(id);
    if (id === 'VERTICAL') setAspect('9:16');
  });
  cameraButtons.append(b);
}

function setLighting(id: string) {
  activeLight = id;
  lightName.textContent = id;
  if (id === 'LONG_ONE') {
    renderer.toneMappingExposure = 0.94;
    hemi.intensity = 0.64;
    sun.intensity = 1.65;
    interiorFill.intensity = 0.46;
  } else if (id === 'WITNESS_SHOCK') {
    renderer.toneMappingExposure = 1.04;
    hemi.intensity = 0.56;
    sun.intensity = 2.55;
    interiorFill.intensity = 0.24;
  } else {
    renderer.toneMappingExposure = 1.02;
    hemi.intensity = 0.78;
    sun.intensity = 2.15;
    interiorFill.intensity = 0.35;
  }
}

document.querySelectorAll<HTMLButtonElement>('[data-light]').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('[data-light]').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  setLighting(b.dataset.light || 'SOURCE-DAY');
}));

function setAspect(value: '16:9' | '9:16') {
  activeAspect = value;
  frameGuide.classList.toggle('landscape', value === '16:9');
  frameGuide.classList.toggle('portrait', value === '9:16');
  document.querySelectorAll('[data-aspect]').forEach(x => x.classList.toggle('active', (x as HTMLElement).dataset.aspect === value));
}

document.querySelectorAll<HTMLButtonElement>('[data-aspect]').forEach(b => b.addEventListener('click', () => setAspect((b.dataset.aspect || '16:9') as '16:9' | '9:16')));
document.querySelectorAll<HTMLButtonElement>('[data-transform]').forEach(button => button.addEventListener('click', () => {
  transform.setMode(button.dataset.transform as 'translate' | 'rotate' | 'scale');
  document.querySelectorAll('[data-transform]').forEach(b => b.classList.remove('active'));
  button.classList.add('active');
}));

function snapshot() {
  return {
    camera: activeCamera,
    light: activeLight,
    aspect: activeAspect,
    objects: Array.from(selectable).map(obj => ({
      id: obj.userData.instanceId,
      name: obj.name,
      position: obj.position.toArray(),
      rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
      scale: obj.scale.toArray(),
    })),
  };
}

function saveScene() {
  localStorage.setItem('wnn-previs-rescue-v1', JSON.stringify(snapshot()));
  selectionLabel.textContent = 'Saved in this browser';
}

function loadScene() {
  const raw = localStorage.getItem('wnn-previs-rescue-v1');
  if (!raw) return;
  const data = JSON.parse(raw);
  for (const state of data.objects || []) {
    const obj = Array.from(selectable).find(x => x.userData.instanceId === state.id || x.name === state.name);
    if (!obj) continue;
    obj.position.fromArray(state.position);
    obj.rotation.set(state.rotation[0], state.rotation[1], state.rotation[2]);
    obj.scale.fromArray(state.scale);
  }
  setLighting(data.light || 'SOURCE-DAY');
  setAspect(data.aspect || '16:9');
  setCamera(data.camera || 'REF-SEATED', false);
  selectionLabel.textContent = 'Scene loaded';
}

document.querySelector('#saveScene')?.addEventListener('click', saveScene);
document.querySelector('#loadScene')?.addEventListener('click', loadScene);
document.querySelector('#resetScene')?.addEventListener('click', buildRoom);

const modelInput = document.querySelector('#modelInput') as HTMLInputElement | null;
modelInput?.addEventListener('change', () => {
  const file = modelInput.files?.[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  new GLTFLoader().load(url, gltf => {
    const imported = gltf.scene;
    imported.name = `imported-${file.name}`;
    imported.position.set(0, 0, 0.4);
    imported.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    root.add(imported);
    register(imported, 'imported-glb');
    select(imported);
    URL.revokeObjectURL(url);
  }, undefined, error => {
    console.warn('Imported GLB failed', error);
    URL.revokeObjectURL(url);
  });
});

function resize() {
  const rect = viewport.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = Math.max(0.1, rect.width / Math.max(1, rect.height));
  camera.updateProjectionMatrix();
}

new ResizeObserver(resize).observe(viewport);
resize();
buildRoom();
setAspect('16:9');

function animate(time: number) {
  requestAnimationFrame(animate);
  if (transition) {
    const t = Math.min(1, (time - transition.start) / transition.duration);
    const ease = 1 - Math.pow(1 - t, 3);
    camera.position.lerpVectors(transition.fromPos, transition.toPos, ease);
    orbit.target.lerpVectors(transition.fromTarget, transition.toTarget, ease);
    if (t >= 1) transition = null;
  }
  orbit.update();
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);
