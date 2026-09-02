import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import "./style.css";

type TransformMode = "translate" | "rotate" | "scale";

type SerializedObject = {
  id: string;
  kind: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
};

const viewport = document.querySelector<HTMLDivElement>("#viewport")!;
const selectionLabel = document.querySelector<HTMLParagraphElement>("#selection")!;

const scene = new THREE.Scene();
scene.background = new THREE.Color("#171412");

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
camera.position.set(8.5, 5.6, 8.8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
viewport.appendChild(renderer.domElement);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.target.set(0, 1.2, 0);
orbit.enableDamping = true;

const transform = new TransformControls(camera, renderer.domElement);
transform.setTranslationSnap(0.25);
transform.setRotationSnap(THREE.MathUtils.degToRad(15));
scene.add(transform.getHelper());
transform.addEventListener("dragging-changed", (event) => {
  orbit.enabled = !event.value;
});

scene.add(new THREE.AmbientLight("#ffd8be", 1.0));
const key = new THREE.DirectionalLight("#fff2df", 2.2);
key.position.set(6, 8, 5);
key.castShadow = true;
scene.add(key);

const roomRoot = new THREE.Group();
roomRoot.name = "wnn-room";
scene.add(roomRoot);

const selectable = new Map<string, THREE.Object3D>();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const loader = new GLTFLoader();
let objectCounter = 0;

function addBox(
  id: string,
  size: [number, number, number],
  position: [number, number, number],
  color: string,
  kind: string
) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(...size),
    new THREE.MeshStandardMaterial({ color, roughness: 0.8 })
  );
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = { id, kind, selectable: true };
  roomRoot.add(mesh);
  selectable.set(id, mesh);
  return mesh;
}

function addWall(size: [number, number, number], position: [number, number, number], color = "#5b4b42") {
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(...size),
    new THREE.MeshStandardMaterial({ color, roughness: 0.95 })
  );
  wall.position.set(...position);
  wall.receiveShadow = true;
  roomRoot.add(wall);
}

function addActor(id: string, x: number, z: number, kind: string) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.28, 1.0, 6, 12),
    new THREE.MeshStandardMaterial({ color: kind === "witness" ? "#7b2e2e" : "#6d655f", roughness: 0.9 })
  );
  body.position.y = 0.8;
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 16, 16),
    new THREE.MeshStandardMaterial({ color: "#9b745a", roughness: 0.95 })
  );
  head.position.y = 1.7;
  group.add(body, head);
  group.position.set(x, 0, z);
  group.userData = { id, kind, selectable: true };
  roomRoot.add(group);
  selectable.set(id, group);
  return group;
}

function clearRoom() {
  transform.detach();
  selectable.clear();
  for (const child of [...roomRoot.children]) {
    child.removeFromParent();
  }
}

function buildRoom() {
  clearRoom();

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(7.5, 6),
    new THREE.MeshStandardMaterial({ color: "#3d332b", roughness: 0.95 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  roomRoot.add(floor);

  // Three enclosing sides stay legible while keeping the camera side open.
  addWall([7.5, 3.1, 0.12], [0, 1.55, -3]);
  addWall([0.12, 3.1, 6], [3.75, 1.55, 0]);
  // West wall is split to leave the WNN side entrance visible.
  addWall([0.12, 3.1, 2.15], [-3.75, 1.55, -1.92]);
  addWall([0.12, 3.1, 2.75], [-3.75, 1.55, 1.63]);

  addBox("anchor-table", [3.1, 0.18, 1.1], [0, 0.86, 0], "#4b2f1f", "anchor");
  addBox("crt-main", [1.5, 1.0, 0.32], [2.85, 1.75, -2.78], "#2d3438", "screen");
  addBox("crate-01", [0.7, 0.55, 0.7], [-2.65, 0.275, -2.15], "#6b4d2f", "set-dressing");
  addBox("bar-counter", [1.8, 1.05, 0.7], [2.55, 0.525, 1.55], "#3b271d", "set-dressing");

  addActor("host-proxy", -1.0, 0.35, "anchor");
  addActor("coanchor-proxy", 1.0, 0.35, "anchor");
  addActor("witness-proxy", 2.55, -1.15, "witness");
  selectionLabel.textContent = "Nothing selected";
}

function serializeScene(): SerializedObject[] {
  return Array.from(selectable.entries()).map(([id, object]) => ({
    id,
    kind: object.userData.kind ?? "item",
    position: [object.position.x, object.position.y, object.position.z],
    rotation: [object.rotation.x, object.rotation.y, object.rotation.z],
    scale: [object.scale.x, object.scale.y, object.scale.z],
  }));
}

function saveScene() {
  localStorage.setItem("wnn-previs-v0", JSON.stringify(serializeScene()));
  selectionLabel.textContent = "Scene saved locally";
}

function loadScene() {
  const raw = localStorage.getItem("wnn-previs-v0");
  if (!raw) {
    selectionLabel.textContent = "No saved scene yet";
    return;
  }
  const saved = JSON.parse(raw) as SerializedObject[];
  for (const item of saved) {
    const object = selectable.get(item.id);
    if (!object) continue;
    object.position.set(...item.position);
    object.rotation.set(...item.rotation);
    object.scale.set(...item.scale);
  }
  selectionLabel.textContent = "Saved transforms restored";
}

renderer.domElement.addEventListener("pointerdown", (event) => {
  if ((event.target as HTMLElement).closest(".panel")) return;
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(Array.from(selectable.values()), true);
  if (!hits.length) {
    transform.detach();
    selectionLabel.textContent = "Nothing selected";
    return;
  }
  let root: THREE.Object3D | null = hits[0].object;
  while (root && !root.userData.selectable) root = root.parent;
  if (!root) return;
  transform.attach(root);
  selectionLabel.textContent = `${root.userData.id} / ${root.userData.kind}`;
});

for (const button of document.querySelectorAll<HTMLButtonElement>("[data-transform]")) {
  button.addEventListener("click", () => {
    const mode = button.dataset.transform as TransformMode;
    transform.setMode(mode);
    document.querySelectorAll("[data-transform]").forEach((el) => el.classList.remove("active"));
    button.classList.add("active");
  });
}

document.querySelector<HTMLButtonElement>("#resetScene")!.addEventListener("click", buildRoom);
document.querySelector<HTMLButtonElement>("#saveScene")!.addEventListener("click", saveScene);
document.querySelector<HTMLButtonElement>("#loadScene")!.addEventListener("click", loadScene);

document.querySelector<HTMLInputElement>("#modelInput")!.addEventListener("change", async (event) => {
  const input = event.currentTarget;
  const file = input.files?.[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  try {
    const gltf = await loader.loadAsync(url);
    const root = gltf.scene;
    const id = `imported-${++objectCounter}`;
    root.userData = { id, kind: "imported-prop", selectable: true };
    root.position.set(0, 0, -1.2);
    root.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    roomRoot.add(root);
    selectable.set(id, root);
    transform.attach(root);
    selectionLabel.textContent = `${id} / imported-prop`;
  } catch (error) {
    console.error(error);
    selectionLabel.textContent = "Import failed — use a self-contained GLB for this spike";
  } finally {
    URL.revokeObjectURL(url);
    input.value = "";
  }
});

function resize() {
  const width = viewport.clientWidth;
  const height = viewport.clientHeight;
  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}
window.addEventListener("resize", resize);

buildRoom();
resize();

function frame() {
  orbit.update();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
frame();
