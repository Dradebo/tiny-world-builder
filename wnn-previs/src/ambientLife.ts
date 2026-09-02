import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

type Role = 'host' | 'cohost' | 'witness' | 'regular' | 'proprietor';
export type WnnCharacter = {
  root: THREE.Group;
  role: Role;
  mixer?: THREE.AnimationMixer;
  phase: number;
  nextGestureAt: number;
};

type TableThing = { object: THREE.Object3D; base: THREE.Vector3; phase: number; amount: number };

const loader = new GLTFLoader();
const people: WnnCharacter[] = [];
const tableThings: TableThing[] = [];
let editorialPulse = 0;
let lastUpdate = performance.now();

// Browser-ready CC0 Quaternius donor cast, already packaged and validated by vanta-city.
const DONORS: Record<Role, { url: string; scale: number }> = {
  host: {
    url: 'https://raw.githubusercontent.com/schulerj89/vanta-city/main/public/assets/characters/animated-men/mack-long-sleeves.glb',
    scale: .370,
  },
  cohost: {
    url: 'https://raw.githubusercontent.com/schulerj89/vanta-city/main/public/assets/characters/animated-men/nox-layered-shirt.glb',
    scale: .368,
  },
  witness: {
    url: 'https://raw.githubusercontent.com/schulerj89/vanta-city/main/public/assets/characters/cc0-animated-cast/hoodie-character.glb',
    scale: .98,
  },
  regular: {
    url: 'https://raw.githubusercontent.com/schulerj89/vanta-city/main/public/assets/characters/cc0-animated-cast/worker.glb',
    scale: .98,
  },
  proprietor: {
    url: 'https://raw.githubusercontent.com/schulerj89/vanta-city/main/public/assets/characters/cc0-animated-cast/farmer.glb',
    scale: .98,
  },
};

const dark = new THREE.MeshStandardMaterial({ color: '#211d1a', roughness: .86 });
const bottleGlass = new THREE.MeshStandardMaterial({ color: '#244d31', roughness: .42, metalness: .02, transparent: true, opacity: .92 });

function primitive(geometry: THREE.BufferGeometry, material: THREE.Material) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function beerBottle() {
  const g = new THREE.Group();
  const body = primitive(new THREE.CylinderGeometry(.065,.075,.34,10), bottleGlass); body.position.y=.17;
  const neck = primitive(new THREE.CylinderGeometry(.028,.045,.16,10), bottleGlass); neck.position.y=.42;
  const cap = primitive(new THREE.CylinderGeometry(.032,.032,.018,10), dark); cap.position.y=.51;
  g.add(body,neck,cap);
  return g;
}

function tableCigarette(length=.17) {
  const g = new THREE.Group();
  const paper = primitive(new THREE.CylinderGeometry(.008,.008,length,8), new THREE.MeshStandardMaterial({color:'#d8d0bc',roughness:.8}));
  paper.rotation.z=Math.PI/2;
  const ember = primitive(new THREE.SphereGeometry(.011,6,4), new THREE.MeshStandardMaterial({color:'#7e351f',emissive:'#5b160c',emissiveIntensity:.7}));
  ember.position.x=length*.5;
  g.add(paper,ember);
  return g;
}

function findClip(clips: THREE.AnimationClip[], suffixes: string[]) {
  return clips.find(c => suffixes.some(s => c.name === s || c.name.endsWith(s)));
}

export function createCharacter(opts: {name:string; role:Role; x:number; z:number; rotY?:number; shirt:string; seated?:boolean; bottle?:boolean; cigarette?:boolean}) {
  const root = new THREE.Group();
  root.name = opts.name;
  root.position.set(opts.x,0,opts.z);
  root.rotation.y = opts.rotY ?? 0;

  // Small neutral placeholder while the donor GLB arrives; removed immediately after load.
  const placeholder = primitive(new THREE.BoxGeometry(.38,1.15,.24), new THREE.MeshStandardMaterial({color:opts.shirt,roughness:.95}));
  placeholder.position.y=.58;
  root.add(placeholder);

  const character: WnnCharacter = { root, role: opts.role, phase: Math.random()*10, nextGestureAt: performance.now()+7000+Math.random()*12000 };
  people.push(character);

  const donor = DONORS[opts.role];
  loader.load(donor.url, (gltf) => {
    root.remove(placeholder);
    const model = gltf.scene;
    model.name = `${opts.name}-donor`;
    model.scale.setScalar(donor.scale);
    model.rotation.y = Math.PI;
    model.traverse((child:any)=>{
      if(child.isMesh){ child.castShadow=true; child.receiveShadow=true; }
    });
    root.add(model);

    const mixer = new THREE.AnimationMixer(model);
    character.mixer = mixer;

    const sitting = findClip(gltf.animations,['HumanArmature|Man_Sitting','Man_Sitting']);
    const idle = findClip(gltf.animations,['CharacterArmature|Idle','HumanArmature|Man_Idle','Man_Idle']);
    const base = opts.seated !== false && sitting ? sitting : idle;
    if(base){
      const action=mixer.clipAction(base);
      action.setLoop(THREE.LoopRepeat,Infinity);
      action.play();
      // De-sync identical loops so the table never looks choreographed.
      action.time=Math.random()*Math.max(.01,base.duration);
    }
  }, undefined, (error) => {
    console.warn(`WNN donor character failed: ${opts.name}`, error);
  });

  return character;
}

export function clearAmbientCharacters(){
  for(const p of people) p.mixer?.stopAllAction();
  people.splice(0,people.length);
  tableThings.splice(0,tableThings.length);
}

export function triggerEditorialBeat(strength=1){ editorialPulse=Math.max(editorialPulse,strength); }

export function updateAmbientLife(timeMs:number){
  const delta=Math.min(.05,Math.max(0,(timeMs-lastUpdate)/1000));
  lastUpdate=timeMs;
  editorialPulse*=.965;

  for(let i=0;i<people.length;i++){
    const p=people[i];
    p.mixer?.update(delta);
    const q=timeMs*.00032+p.phase;
    // The authored animation does the body work. WNN only adds tiny social drift and editorial attention.
    p.root.rotation.z=Math.sin(q*.41+i)*.006;
    p.root.rotation.y += Math.sin(q*.17+i)*.00012;
    if(editorialPulse>.08){
      const bias=p.role==='witness' ? -.20 : (i%2?.055:-.035);
      p.root.rotation.y += bias*editorialPulse*.018;
    }
  }

  for(let i=0;i<tableThings.length;i++){
    const thing=tableThings[i]; const q=timeMs*.00011+thing.phase;
    thing.object.position.x=thing.base.x + Math.sin(q)*thing.amount;
    thing.object.position.z=thing.base.z + Math.sin(q*.73+1.7)*thing.amount*.65;
    thing.object.rotation.y += Math.sin(q*.31+i)*.00012;
  }
}

export function makeTableLife(parent:THREE.Group){
  const positions:[number,number,number][]=[[-.48,.79,.06],[.38,.79,.02],[.05,.79,.45]];
  positions.forEach((pos,i)=>{
    const b=beerBottle(); b.position.set(...pos); b.rotation.y=i*.8; parent.add(b);
    tableThings.push({object:b,base:b.position.clone(),phase:Math.random()*8,amount:.008+i*.003});
  });

  const lighter=primitive(new THREE.BoxGeometry(.055,.025,.13),new THREE.MeshStandardMaterial({color:'#b54b27',roughness:.7}));
  lighter.position.set(-.12,.755,-.06); lighter.rotation.y=.55; parent.add(lighter);
  tableThings.push({object:lighter,base:lighter.position.clone(),phase:3.4,amount:.005});

  const ashtray=primitive(new THREE.CylinderGeometry(.12,.12,.035,12),new THREE.MeshStandardMaterial({color:'#3e3b38',roughness:.75}));
  ashtray.position.set(.5,.76,.38); parent.add(ashtray);
  tableThings.push({object:ashtray,base:ashtray.position.clone(),phase:5.1,amount:.002});

  const phone=primitive(new THREE.BoxGeometry(.16,.025,.3),dark);
  phone.position.set(-.45,.76,.4); phone.rotation.y=-.3; parent.add(phone);
  tableThings.push({object:phone,base:phone.position.clone(),phase:7.2,amount:.004});

  const cigA=tableCigarette(.18); cigA.position.set(.33,.785,.40); cigA.rotation.y=.45; parent.add(cigA);
  const cigB=tableCigarette(.11); cigB.position.set(.44,.785,.32); cigB.rotation.y=-.8; parent.add(cigB);
  tableThings.push({object:cigA,base:cigA.position.clone(),phase:2.2,amount:.0015},{object:cigB,base:cigB.position.clone(),phase:6.4,amount:.001});
}
