# WNN PREVIS Forensic Rescue

## Status

This is a forensic record of the September 2 WNN PREVIS spike and a rescue plan for the existing Three.js implementation.

The goal is **not** to pretend the spike was production-ready. The goal is to extract why it failed, encode those failures into the design-recon/visual-compiler workflow, and produce a better static set proof before Blender.

---

# 1. Recovered evidence

## Source-reference photographs

The surviving reference set from the real location includes:

| File | Evidence carried |
|---|---|
| `1000561357.jpg` | wide paved forecourt, wooden folding tables/chairs, shopfront spacing, exterior scale, late-afternoon light |
| `1000561358.jpg` | liquor/shop counter, stocked shelves, metal grille doors, tiled threshold, folding furniture, stacked chairs |
| `1000561364.jpg` | broom, bucket, stacked chair/stool families, column, threshold residue, sun direction |
| `1000561363.jpg` | seated table viewpoint, worn wood, bottle, green plastic chair + wooden chair coexistence, human-scale relationships |

## Failed output screenshots

| File | Failure evidence |
|---|---|
| `1000561661.png` | WNN PREVIS v0 MASTER view; giant cream and green geometry dominates; hero table/people become microscopic; camera reads as high inspection view |
| `1000561675.png` | second MASTER angle; shopfront collapses into abstract brown/green slabs and giant cream forms; source relationships are no longer recognizable |

## Recovered implementation

Branch: `feat/wnn-previs-spike`

Key files:

- `wnn-previs/src/main.ts`
- `wnn-previs/src/ambientLife.ts`

The spike does contain useful production primitives: camera presets, transform controls, scene save/load, folding furniture builders, counter/shelves, CRT, table props, character donors, ambient behavior, and editorial beats. Rescue the useful apparatus; reject the broken visual truth.

---

# 2. Central diagnosis

The source material was sufficient.

The implementation preserved **object nouns** but discarded the **relationships** that made the source location legible.

It knew there should be:

- a shop;
- counter;
- shelves;
- bottles;
- table;
- chairs;
- people;
- CRT;
- broom/bucket;
- beer/cigarette life.

But it failed to preserve:

- human scale;
- threshold/forecourt proportions;
- furniture-family silhouettes;
- open-front shop geometry;
- camera-to-room relationship;
- depth and occlusion;
- exterior/interior light relationship;
- accumulated rather than designed placement;
- commerce + congregation in one frame.

This is the exact class of failure the Visual Compiler must prevent.

---

# 3. Failure matrix

## F01 — Human-scale hierarchy collapsed

### Source truth

Furniture, doorway/grille height, counter, stacked chairs, columns, and bottles provide repeated human-scale anchors.

### Spike behavior

The MASTER camera is defined high and far away (`[7.6, 4.1, 8.6]` looking around `[0, 1.25, 0.15]`). The screenshot therefore evaluates the scene as a model rather than a place.

### Information lost

The viewer cannot intuitively compare table, seat, doorway, person, and room dimensions.

### Compiler rule

Every environment must define explicit scale anchors before visual detail:

```text
human height
seat height
table height
door/grille height
counter height
```

### Rescue gate

Create fixed seated-eye and standing-eye truth cameras before judging cinematic cameras.

---

## F02 — Camera was an editorial gadget before it was a measurement instrument

### Source truth

One reference is effectively a seated-next-table view. The real location is understood from human viewpoints.

### Spike behavior

The UI exposes MASTER/HOST/CO-ANCHOR/TWO-SHOT/etc., but the underlying spatial truth had not passed a human-eye QA gate.

### Information lost

A sophisticated camera-control UI created false confidence around a broken scene.

### Compiler rule

Camera order:

1. `REF_SEATED`
2. `REF_STANDING`
3. optional plan/debug
4. only then editorial camera grammar

### Rescue gate

At least one seated frame must communicate shop + gathering without orbiting the scene.

---

## F03 — Shopfront became generic room geometry

### Source truth

The photographed location reads as an open shopfront spilling onto a forecourt. Metal grilles, columns, tiled threshold and exterior paving create the transition.

### Spike behavior

`buildRoom()` creates a large floor plus full back, left, and right walls. The implementation solves a generic room box rather than the observed open-front relationship.

### Information lost

The strongest architectural fact — commerce opening into public/social spillover — is weakened.

### Compiler rule

Model the transition first:

```text
exterior paving
→ threshold step/tile
→ columns / grille frame
→ open shop mouth
→ counter + stock depth
```

### Rescue gate

The scene must read as an open shopfront even with all props hidden.

---

## F04 — Furniture nouns survived; furniture silhouettes did not

### Source truth

The location contains multiple recognizable furniture families: wooden folding chairs/tables plus stacked plastic/woven chairs/stools.

### Spike behavior

The wooden chair builder is an approximation, but `stacked-plastic-*` is literally a stack of thin boxes, not chair silhouettes.

### Information lost

The scene says "green repeated object" rather than "stacked chairs," losing both function and lived-in set dressing.

### Compiler rule

A primitive representation must preserve the recognition-bearing silhouette.

For a chair, the minimum is:

- seat plane;
- back plane;
- leg/support relationship;
- credible seat height;
- stack behavior when stacked.

### Rescue gate

A grayscale/silhouette screenshot should make each furniture family identifiable without labels.

---

## F05 — Material/color treatment invented a different place

### Source truth

Dominant source relationships:

- pale warm walls/columns;
- grey/black grille metal;
- worn warm wood;
- green chair accents;
- grey-brown pavers;
- bright open exterior;
- warm directional sun.

### Spike behavior

The scene background is near-black/brown and the room is heavily warm-lit. The screenshot therefore reads closer to a cave/bar/diorama than a sunlit open shopfront.

### Information lost

Warmth became a global color cast rather than an observed light/material relationship.

### Compiler rule

Separate:

- material base color;
- illumination color;
- background/exterior value;
- accent color.

Do not encode "warm place" by tinting everything warm.

### Rescue gate

A value-only render must preserve bright exterior vs shaded shop interior without crushed black shadows.

---

## F06 — Source depth relationships were flattened

### Source truth

Columns, grille planes, threshold, counter, shelves and forecourt create clear foreground/midground/background layers.

### Spike behavior

Large wall/slab masses dominate, while the actual social objects become visually tiny.

### Information lost

Foreground, hero social zone, commerce depth and background proof no longer cooperate.

### Compiler rule

Every hero frame must specify:

- foreground evidence;
- hero plane;
- secondary world-proof plane;
- background termination.

### Rescue gate

The hero frame must show social use and commercial use simultaneously.

---

## F07 — Character compatibility was allowed to corrupt environment QA

### Source truth

People are important, but the environment can be validated before final characters.

### Spike behavior

`ambientLife.ts` loads different donor GLBs at manually specified scales and heuristically selects sitting/idle/gesture clips by animation name. It also finds wrists heuristically and mounts props there.

The failed screenshots contain enormous cream tube-like forms that are not consistent with the explicitly tiny bottle geometry. The exact source of the explosion still requires runtime proof, but donor mesh/rig/animation compatibility is a prime suspect and is currently **unverified**.

### Information lost

A character/animation compatibility problem can visually destroy the scene and make environment diagnosis impossible.

### Compiler rule

Unknown rig/animation compatibility is **QUARANTINE**, not "try it and judge the whole scene."

### Rescue gate

Default rescue build uses neutral static human proxies. Donor characters become opt-in until each one passes scale + static pose + animation compatibility checks independently.

---

## F08 — Behavior was implemented before static truth stabilized

### Source truth

The desired final set does include beers, cigarettes, random motion and incidental social life.

### Spike behavior

The code already implements drinking/smoking motions, editorial gestures, table-object drift and character animation while fundamental set scale/composition remained unstable.

### Information lost

Effort moved downward into behavior before the static scene had earned it.

### Compiler rule

```text
scale
→ space
→ silhouette
→ camera
→ value/material
→ light
→ dressing
→ static people
→ animation
→ editorial behavior
```

### Rescue gate

Ambient behavior is not a pass criterion until static reference-camera screenshots pass.

---

# 4. What the spike actually did well

Do not throw away everything because the render failed.

Useful apparatus to preserve:

- explicit named camera grammar;
- frame/aspect guides;
- transform controls;
- scene snapshot/save/load;
- a reusable primitive-factory approach;
- table-life prop concept;
- editorial beat abstraction;
- cast roles (host/cohost/witness);
- local editability in-browser.

The failure was primarily **authoring judgment and ordering**, not absence of engineering capability.

---

# 5. Rescue doctrine

## Stage 0 — Quarantine unstable character donors

- donor characters OFF by default;
- neutral human-scale proxies remain in scene;
- optional query/config flag may re-enable donors for isolated compatibility testing.

## Stage 1 — Establish canonical physical scale

Initial target anchors (adjust only with evidence):

```text
human_height ≈ 1.73 m
seat_height ≈ 0.45 m
table_height ≈ 0.74 m
counter_height ≈ 0.95–1.05 m
door/grille_height ≈ 2.1 m
```

The exact scene does not need survey-grade measurement. It needs internally consistent human scale.

## Stage 2 — Rebuild the open-front spatial grammar

Priority order:

1. exterior paving;
2. threshold/tile rise;
3. columns / shallow side returns;
4. grille/opening frame;
5. shop interior back plane;
6. counter;
7. stock/shelves.

No neighboring street build yet.

## Stage 3 — Fix recognition-bearing furniture silhouettes

- wooden folding table family;
- wooden folding chair family;
- plastic chair family;
- stacked-chair family.

Controlled variation only after each base family reads correctly.

## Stage 4 — Truth cameras

Add:

- `REF-SEATED`
- `REF-STANDING`

Do not remove editorial cameras; stop using them as the first QA surface.

## Stage 5 — Restore source value/light relationships

- bright exterior background/forecourt;
- shaded but readable shop interior;
- warm directional sun;
- neutral enough fill to preserve material identity;
- no global "brown cave" treatment.

## Stage 6 — Set dressing

Only after spatial proof:

- bottle/crate clusters;
- broom;
- bucket;
- stacked furniture;
- CRT/WNN cue;
- small setup residue.

## Stage 7 — Character compatibility ladder

For each donor:

1. load static;
2. verify bounding height;
3. verify orientation;
4. verify seat placement;
5. verify idle;
6. verify sitting clip;
7. verify gesture;
8. verify wrist prop mount;
9. only then admit to default scene.

---

# 6. Acceptance invariants

The rescue does not pass because "it is less ugly."

It passes when:

- the shopfront reads before the WNN branding;
- a human viewer can infer scale without orbiting;
- table/chairs no longer look microscopic relative to architecture;
- open exterior and shaded interior are both legible;
- wood and plastic chair families are identifiable by silhouette;
- commerce remains visible behind/beside the social zone;
- `REF-SEATED` feels like sitting at the next table;
- no unverified donor asset can visually explode the default scene;
- no core frame reads as a designed bar/studio;
- the two old failure screenshots are impossible under the new default QA path.

---

# 7. The lesson to preserve

The old WNN spike is valuable precisely because it failed so loudly.

The engineering stack could place objects, animate characters, move cameras, persist scene edits and deploy a web experience.

What it lacked was a compiler that preserved **visual truth** between reference and renderer.

That compiler is now a first-class part of the build process.
