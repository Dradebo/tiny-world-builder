import * as THREE from 'three';

export type WnnCharacter = {
  root: THREE.Group;
  head: THREE.Group;
  torso: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  bottle?: THREE.Group;
  cigarette?: THREE.Group;
  phase: number;
  mood: number;
  role: 'host' | 'cohost' | 'witness' | 'regular' | 'proprietor';
};

const people: WnnCharacter[] = [];
let editorialPulse = 0;

const skin = new THREE.MeshStandardMaterial({ color: '#5b3828', roughness: .92 });
const dark = new THREE.MeshStandardMaterial({ color: '#211d1a', roughness: .86 });
const bottleGlass = new THREE.MeshStandardMaterial({ color: '#244d31', roughness: .42, metalness: .02, transparent: true, opacity: .92 });
const emberMat = new THREE.MeshStandardMaterial({ color: '#b24524', emissive: '#7a1f12', emissiveIntensity: 1.5 });

function primitive(geometry: THREE.BufferGeometry, material: THREE.Material) {
  const mesh = new THREE.Mesh(geometry, material); mesh.castShadow = true; mesh.receiveShadow = true; return mesh;
}

function limb(length: number, color: string) {
  const g = new THREE.Group();
  const m = primitive(new THREE.CapsuleGeometry(.075, length, 3, 6), new THREE.MeshStandardMaterial({color, roughness:.9}));
  m.position.y = -length * .5; g.add(m); return g;
}

function beerBottle() {
  const g = new THREE.Group();
  const body = primitive(new THREE.CylinderGeometry(.065,.075,.34,10), bottleGlass); body.position.y=.17;
  const neck = primitive(new THREE.CylinderGeometry(.028,.045,.16,10), bottleGlass); neck.position.y=.42;
  const cap = primitive(new THREE.CylinderGeometry(.032,.032,.018,10), dark); cap.position.y=.51;
  g.add(body,neck,cap); return g;
}

function cigarette() {
  const g = new THREE.Group();
  const paper = primitive(new THREE.CylinderGeometry(.011,.011,.22,8), new THREE.MeshStandardMaterial({color:'#ddd4be',roughness:.8})); paper.rotation.z=Math.PI/2;
  const ember = primitive(new THREE.SphereGeometry(.014,6,4), emberMat); ember.position.x=.11;
  g.add(paper,ember); return g;
}

export function createCharacter(opts: {name:string; role:WnnCharacter['role']; x:number; z:number; rotY?:number; shirt:string; seated?:boolean; bottle?:boolean; cigarette?:boolean}) {
  const root = new THREE.Group(); root.name = opts.name; root.position.set(opts.x,0,opts.z); root.rotation.y=opts.rotY ?? 0;
  const torso = new THREE.Group(); torso.position.y=opts.seated===false?1.05:.93; root.add(torso);
  const shirt = primitive(new THREE.BoxGeometry(.48,.64,.27), new THREE.MeshStandardMaterial({color:opts.shirt,roughness:.9})); shirt.position.y=.02; torso.add(shirt);
  const head = new THREE.Group(); head.position.y=.52; torso.add(head);
  const face = primitive(new THREE.SphereGeometry(.19,10,8),skin); face.scale.set(.9,1.05,.86); head.add(face);
  const hair = primitive(new THREE.SphereGeometry(.195,10,5),dark); hair.scale.set(.93,.45,.9); hair.position.y=.12; head.add(hair);

  const leftArm=limb(.45,opts.shirt), rightArm=limb(.45,opts.shirt); leftArm.position.set(-.3,.25,0); rightArm.position.set(.3,.25,0); torso.add(leftArm,rightArm);
  leftArm.rotation.z=.18; rightArm.rotation.z=-.18;
  const foreL=limb(.38,'#5b3828'),foreR=limb(.38,'#5b3828'); foreL.position.y=-.42; foreR.position.y=-.42; leftArm.add(foreL); rightArm.add(foreR);
  foreL.rotation.z=-.5; foreR.rotation.z=.5;

  for (const side of [-1,1]) {
    const thigh=limb(.48,'#302b27'); thigh.position.set(side*.16,opts.seated===false?-.28:-.28,0); torso.add(thigh);
    thigh.rotation.x=opts.seated===false?0:-1.2;
    const shin=limb(.47,'#332f2b'); shin.position.y=-.45; thigh.add(shin); shin.rotation.x=opts.seated===false?0:1.35;
    const shoe=primitive(new THREE.BoxGeometry(.17,.1,.3),dark); shoe.position.set(0,-.49,.08); shin.add(shoe);
  }

  let bottle:THREE.Group|undefined; if(opts.bottle){ bottle=beerBottle(); bottle.position.set(.02,-.72,.03); foreR.add(bottle); }
  let cig:THREE.Group|undefined; if(opts.cigarette){ cig=cigarette(); cig.position.set(-.02,-.4,.07); cig.rotation.z=.15; foreL.add(cig); }

  const character:WnnCharacter={root,head,torso,leftArm,rightArm,bottle,cigarette:cig,phase:Math.random()*10,mood:Math.random(),role:opts.role};
  root.userData.wnnCharacter=character; people.push(character); return character;
}

export function clearAmbientCharacters(){ people.splice(0,people.length); }

export function triggerEditorialBeat(strength=1){ editorialPulse=Math.max(editorialPulse,strength); }

export function updateAmbientLife(timeMs:number){
  const t=timeMs*.001;
  editorialPulse*=.965;
  for(let i=0;i<people.length;i++){
    const p=people[i]; const q=t*.34+p.phase;
    const slow=Math.sin(q)*.018; const glance=Math.sin(q*.63+i)*.10;
    // low-amplitude unsynchronised motion: nobody is frozen, nobody is "performing idle animation".
    p.torso.rotation.z=slow; p.torso.rotation.x=Math.sin(q*.41)*.025 - editorialPulse*(p.role==='witness'?.05:.018);
    p.head.rotation.y=glance + editorialPulse*(p.role==='witness'?-.42:(i%2?.12:-.08));
    p.head.rotation.z=Math.sin(q*.51)*.025;
    p.leftArm.rotation.z=.18 + Math.sin(q*.46)*.035;
    p.rightArm.rotation.z=-.18 + Math.sin(q*.55+1.2)*.04;

    // Sparse drink/cigarette cycles. Different phases prevent tavern-NPC synchronisation.
    if(p.bottle){ const sip=Math.max(0,Math.sin(q*.19-1.25)); const lift=sip>0.82?(sip-.82)/.18:0; p.rightArm.rotation.x=-lift*.82; p.bottle.rotation.z=lift*.35; }
    if(p.cigarette){ const drag=Math.max(0,Math.sin(q*.145+2.1)); const lift=drag>0.9?(drag-.9)/.1:0; p.leftArm.rotation.x=-lift*.6; }
  }
}

export function makeTableLife(parent:THREE.Group){
  const objects:THREE.Object3D[]=[];
  const positions:[number,number,number][]=[[-.48,.79,.06],[.38,.79,.02],[.05,.79,.45]];
  positions.forEach((pos,i)=>{const b=beerBottle();b.position.set(...pos);b.rotation.y=i*.8;parent.add(b);objects.push(b);});
  const lighter=primitive(new THREE.BoxGeometry(.055,.025,.13),new THREE.MeshStandardMaterial({color:'#b54b27',roughness:.7})); lighter.position.set(-.12,.755,-.06); lighter.rotation.y=.55; parent.add(lighter);objects.push(lighter);
  const ashtray=primitive(new THREE.CylinderGeometry(.12,.12,.035,12),new THREE.MeshStandardMaterial({color:'#3e3b38',roughness:.75}));ashtray.position.set(.5,.76,.38);parent.add(ashtray);objects.push(ashtray);
  const phone=primitive(new THREE.BoxGeometry(.16,.025,.3),dark);phone.position.set(-.45,.76,.4);phone.rotation.y=-.3;parent.add(phone);objects.push(phone);
  return objects;
}
