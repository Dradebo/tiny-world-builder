import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const viewport = document.querySelector('#viewport') as HTMLElement;
const selectionLabel = document.querySelector('#selection') as HTMLElement;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
viewport.append(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#151311');

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
camera.position.set(8, 5.6, 9);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.target.set(0, 1.25, 0);
orbit.enableDamping = true;

const transform = new TransformControls(camera, renderer.domElement);
transform.setMode('translate');
transform.setTranslationSnap(0.25);
transform.setRotationSnap(THREE.MathUtils.degToRad(15));
scene.add(transform.getHelper());
transform.addEventListener('dragging-changed', (event) => { orbit.enabled = !event.value; });

const ambient = new THREE.HemisphereLight('#e7d6bd', '#2a201a', 1.2);
scene.add(ambient);
const key = new THREE.DirectionalLight('#fff0d0', 2.2);
key.position.set(4, 7, 5);
key.castShadow = true;
scene.add(key);

const root = new THREE.Group();
root.name = 'wnn-room';
scene.add(root);

const selectable = new Set<THREE.Object3D>();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let selected: THREE.Object3D | null = null;
let objectCounter = 0;

function mat(color: string) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.88, metalness: 0.04 });
}

function box(name: string, size: [number, number, number], pos: [number, number, number], color: string, selectableFlag = false) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), mat(color));
  mesh.name = name;
  mesh.position.set(...pos);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  root.add(mesh);
  if (selectableFlag) {
    mesh.userData.kind = 'prop';
    mesh.userData.assetId = name;
    mesh.userData.instanceId = `${name}-${++objectCounter}`;
    selectable.add(mesh);
  }
  return mesh;
}

function actorProxy(name: string, x: number, z: number, color: string) {
  const group = new THREE.Group();
  group.name = name;
  group.userData.kind = 'prop';
  group.userData.assetId = 'actor-proxy';
  group.userData.instanceId = `${name}-${++objectCounter}`;
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 1.05, 4, 8), mat(color));
  body.position.y = 0.78;
  body.castShadow = true;
  group.add(body);
  group.position.set(x, 0, z);
  root.add(group);
  selectable.add(group);
  return group;
}

function buildRoom() {
  root.clear();
  selectable.clear();
  transform.detach();
  selected = null;
  selectionLabel.textContent = 'Nothing selected';
  objectCounter = 0;

  const W = 7.5, D = 6.0, H = 3.1, T = 0.12;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), mat('#3b3128'));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  root.add(floor);

  box('north-wall', [W, H, T], [0, H / 2, -D / 2], '#7a604a');
  box('south-wall', [W, H, T], [0, H / 2, D / 2], '#725947');
  box('east-wall', [T, H, D], [W / 2, H / 2, 0], '#6f5847');
  // west wall with doorway gap
  box('west-wall-a', [T, H, 1.9], [-W / 2, H / 2, -2.05], '#725947');
  box('west-wall-b', [T, H, 2.7], [-W / 2, H / 2, 1.65], '#725947');
  box('west-door-top', [T, 0.9, 1.4], [-W / 2, 2.65, -0.15], '#725947');

  box('anchor-table', [3.2, 0.82, 1.05], [0, 0.41, 0], '#4a2e20', true);
  box('crt', [1.5, 1.0, 0.35], [2.6, 1.75, -2.72], '#24211f', true);
  box('bar-counter', [2.6, 1.05, 0.7], [-2.2, 0.525, -2.4], '#493126', true);
  box('crate', [0.65, 0.55, 0.65], [2.6, 0.275, 2.1], '#5e442d', true);

  actorProxy('host-proxy', -1.1, 0.25, '#665443');
  actorProxy('coanchor-proxy', 1.1, 0.25, '#635041');
  actorProxy('witness-proxy', 2.45, -1.35, '#4d4b45');

  // imperfect found-object dressing
  for (let i = 0; i < 5; i++) {
    const bottle = box(`bottle-${i+1}`, [0.12, 0.45 + i * 0.02, 0.12], [-2.95 + i * 0.28, 1.28, -2.45], i % 2 ? '#2e4c3a' : '#5c3827');
    bottle.rotation.z = (i - 2) * 0.02;
  }
}

function select(obj: THREE.Object3D | null) {
  selected = obj;
  if (!obj) {
    transform.detach();
    selectionLabel.textContent = 'Nothing selected';
    return;
  }
  transform.attach(obj);
  selectionLabel.textContent = `${obj.name || obj.userData.assetId} · ${obj.userData.instanceId ?? ''}`;
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

for (const button of document.querySelectorAll<HTMLButtonElement>('[data-transform]')) {
  button.addEventListener('click', () => {
    const mode = button.dataset.transform as 'translate' | 'rotate' | 'scale';
    transform.setMode(mode);
    document.querySelectorAll('[data-transform]').forEach((b) => b.classList.remove('active'));
    button.classList.add('active');
  });
}

function snapshot() {
  return Array.from(selectable).map((obj) => ({
    id: obj.userData.instanceId,
    assetId: obj.userData.assetId,
    name: obj.name,
    position: obj.position.toArray(),
    rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
    scale: obj.scale.toArray()
  }));
}

function saveScene() {
  localStorage.setItem('wnn-previs-v0', JSON.stringify(snapshot()));
  selectionLabel.textContent = 'Scene saved in this browser';
}

function loadScene() {
  const raw = localStorage.getItem('wnn-previs-v0');
  if (!raw) return;
  const data = JSON.parse(raw) as Array<any>;
  for (const state of data) {
    const obj = Array.from(selectable).find((x) => x.userData.instanceId === state.id || x.name === state.name);
    if (!obj) continue;
    obj.position.fromArray(state.position);
    obj.rotation.set(...state.rotation);
    obj.scale.fromArray(state.scale);
  }
  selectionLabel.textContent = 'Scene loaded';
}

document.querySelector('#saveScene')?.addEventListener('click', saveScene);
document.querySelector('#loadScene')?.addEventListener('click', loadScene);
document.querySelector('#resetScene')?.addEventListener('click', buildRoom);

const loader = new GLTFLoader();
const modelInput = document.querySelector('#modelInput') as HTMLInputElement;
modelInput.addEventListener('change', async () => {
  const file = modelInput.files?.[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  try {
    const gltf = await loader.loadAsync(url);
    const obj = gltf.scene;
    obj.name = file.name;
    obj.userData.kind = 'prop';
    obj.userData.assetId = file.name;
    obj.userData.instanceId = `custom-${++objectCounter}`;
    obj.position.set(0, 0, 1.8);
    obj.traverse((child: any) => {
      if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; }
    });
    root.add(obj);
    selectable.add(obj);
    select(obj);
  } finally {
    URL.revokeObjectURL(url);
    modelInput.value = '';
  }
});

function resize() {
  const { clientWidth, clientHeight } = viewport;
  camera.aspect = clientWidth / Math.max(clientHeight, 1);
  camera.updateProjectionMatrix();
  renderer.setSize(clientWidth, clientHeight, false);
}
window.addEventListener('resize', resize);

buildRoom();
resize();

function tick() {
  orbit.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();
