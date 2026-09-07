---
name: tinyworld-visual-compiler
description: Use whenever a user supplies aesthetic, cultural, spatial, cinematic, emotional, or reference-language "ore" that must be translated into concrete Tiny World Builder / Three.js geometry, materials, lighting, camera, composition, motion, or visual QA instructions.
---

# Q-City Visual Compiler v0

This skill is the missing middle layer between human art-direction language and implementation.

Do not ask the user to restate visual intent in technical 3D language. Treat natural-language judgments, references, comparisons, memories, photographs, videos, cultural descriptions, and "this-but-not-that" statements as valid source material. Your job is to translate them.

The compiler's output is not prose inspiration. It is an implementation contract.

## Core rule

ORE -> VISUAL GRAMMAR -> SCENE IR -> THREE.JS PRIMITIVE PLAN -> VISUAL QA

Do not jump directly from ore to code.

Before editing geometry, compile the request into the Scene IR below. Keep it in your working notes or a repo note when the change is durable. Then implement from the IR.

## 1. Extract the visual thesis

Convert raw language into:

- `scene_thesis`: one sentence describing what the place/object is *really doing visually*.
- `must_read_as`: 2-5 impressions that must survive simplification.
- `must_not_read_as`: explicit anti-targets. Negative constraints are first-class.
- `story_evidence`: physical details that imply history, use, culture, or behavior.

Example:

"a shop that accidentally became the neighbourhood parliament"

becomes:

- scene thesis: commerce remains visually primary while social congregation colonizes its edge.
- must read as: found, useful, social, locally accumulated.
- must not read as: designed venue, nightclub, sterile studio.
- story evidence: visible stock, mismatched seating, setup residue, compressed circulation, one or two objects displaced from their nominal use.

## 2. Compile visual grammar

Score or specify these dimensions before choosing primitives. Use 0-1 values where useful; exact numbers are guidance, not false precision.

### Composition

- `focal_hierarchy`: primary, secondary, tertiary read.
- `occupancy`: fraction of visual field occupied by meaningful forms.
- `negative_space`: low / medium / high.
- `asymmetry`: 0 symmetrical -> 1 strongly asymmetric.
- `depth_layers`: 1-4 readable foreground/midground/background bands.
- `density_gradient`: where detail is concentrated.
- `path_flow`: how the eye/player moves through the scene.

### Shape language

- `dominant_shapes`: box / slab / column / cone / cylinder / organic cluster / spline / arch / stepped mass / other.
- `proportion_bias`: squat / balanced / tall / wide / thin / chunky.
- `edge_character`: sharp / small bevel / rounded / irregular / mixed.
- `silhouette_variance`: 0 uniform -> 1 highly varied.
- `repetition`: regular / rhythmic / clustered / sparse.
- `variation_amplitude`: amount repeated objects differ in scale, rotation, height, material, or detail.

### Scale and spatial grammar

- `human_scale_anchor`: the object or dimension against which all others should feel believable.
- `hierarchy`: dominant landmark vs supporting masses vs detail.
- `compression`: open / moderate / compressed.
- `verticality`: flat / layered / tall.
- `adjacency_rules`: what wants to touch, cluster, line up, face, bridge, or avoid other things.

### Material / color

For this repo prefer simple readable color/material logic over pseudo-PBR complexity.

- `palette_roles`: ground, structure, vegetation, accent, shadow, highlight.
- `saturation`: muted / balanced / vivid.
- `temperature`: cool / neutral / warm.
- `value_separation`: how clearly adjacent forms separate in lightness.
- `surface_variance`: pristine / subtle variation / visibly accumulated / distressed.
- `accent_budget`: approximate fraction of scene allowed to use the strongest color.

### Lighting / atmosphere

- `key_direction`: where dominant light comes from.
- `key_softness`: hard / balanced / soft.
- `fill_floor`: minimum readable shadow level; avoid crushed-black geometry unless explicitly requested.
- `contrast`: low / medium / high.
- `atmosphere`: none / haze / dust / mist / glow / other.
- `post`: brightness, saturation, contrast, warmth, vignette, tilt blur only when they support the thesis rather than hide bad geometry.

### Camera

- `view_job`: map/readability / miniature / observer / cinematic / intimate / monumental.
- `projection`: ortho / soft-perspective / perspective.
- `elevation`: eye / low / medium / high / aerial.
- `lens_feel`: wide / normal / telephoto-miniature.
- `target`: what must dominate the frame.
- `occlusion`: whether foreground forms may partially block the target.
- `framing_precision`: composed / slightly imperfect / deliberately unstable.

### Life / motion

- `motion_amplitude`: none / subtle / medium / expressive.
- `synchrony`: synchronized / staggered / unsynchronized.
- `causal_motion`: motion should appear caused by wind, use, traffic, machinery, growth, social behavior, etc.
- `ambient_vs_event`: distinguish always-on life from editorial/player-triggered events.

## 3. Emit Scene IR

Use this shape whenever an agent needs to carry visual judgment into implementation:

```yaml
scene_thesis: "..."
must_read_as: []
must_not_read_as: []
story_evidence: []

composition:
  focal_hierarchy: []
  occupancy: 0.0
  negative_space: medium
  asymmetry: 0.0
  depth_layers: 3
  density_gradient: "..."
  path_flow: "..."

shape_language:
  dominant_shapes: []
  proportion_bias: balanced
  edge_character: mixed
  silhouette_variance: 0.0
  repetition: clustered
  variation_amplitude: 0.0

spatial:
  human_scale_anchor: "..."
  hierarchy: []
  compression: moderate
  verticality: layered
  adjacency_rules: []

material_color:
  palette_roles: {}
  saturation: balanced
  temperature: neutral
  value_separation: medium
  surface_variance: subtle
  accent_budget: 0.1

lighting:
  key_direction: "..."
  key_softness: balanced
  fill_floor: readable
  contrast: medium
  atmosphere: none
  post: {}

camera:
  view_job: miniature
  projection: soft-perspective
  elevation: medium
  lens_feel: telephoto-miniature
  target: "..."
  occlusion: low
  framing_precision: composed

motion:
  amplitude: subtle
  synchrony: unsynchronized
  causal_motion: []
  ambient_vs_event: "..."

implementation:
  reuse_existing: []
  modify_factories: []
  new_primitive_recipes: []
  new_object_kinds: []
  renderer_changes: []
  forbidden_shortcuts: []

qa:
  invariants: []
  failure_signatures: []
```

## 4. Choose the cheapest implementation route

Use this strict order:

1. **Composition only** — can the request be solved by rearranging existing cells, terrain, floors, camera, palette, or lighting?
2. **Parameter variation** — can existing factories gain scale/rotation/proportion/detail variation?
3. **Primitive recipe** — can a new form be built from existing Three.js primitives and current materials?
4. **New object kind** — only if it represents a reusable semantic object.
5. **Renderer/shader change** — only when the visual property is genuinely screen-space, lighting, atmospheric, or dynamic.
6. **External authored asset / Blender** — outside v0 unless explicitly requested.

Do not solve an art-direction problem by adding architecture complexity.

## 5. Primitive translation dictionary

Translate visual language into concrete Three.js moves.

### Massing / silhouette

- blocky / monumental -> `BoxGeometry`, stacked boxes, larger height ratios, fewer small details.
- terraced / stepped -> stacked slabs with decreasing footprint.
- tapered -> `ConeGeometry`, scaled cylinders, or stacked sections.
- rocky / fractured -> low-detail `DodecahedronGeometry`, nonuniform scale, deterministic rotation clusters.
- soft toy-like -> `roundedBox()` / `roundedSlab()` and small bevels.
- tower / pole / trunk -> `CylinderGeometry` or narrow boxes.
- canopy / crown -> spheres, dodecahedra, rounded boxes, clustered cones.
- roof -> triangular prism / cone / pyramid / thin slab depending shape language.
- arch / cutout -> assemble surrounding boxes first; only introduce CSG if the silhouette cannot be faked cheaply.
- path / river / wall rhythm -> adjacency-aware cells before free splines.

### Controlled imperfection

Never use raw `Math.random()` for durable world identity. Prefer existing seeded cell randomness.

For "found", "handmade", "accumulated", "organic", or "not too perfect":

- vary rotation slightly but preserve functional orientation.
- vary heights more than footprints for grouped vegetation/buildings.
- offset supporting props from exact center.
- use 2-4 repeated variants, not unlimited randomness.
- keep one dominant alignment rule and violate it selectively.

### Detail hierarchy

Do not distribute detail evenly.

- hero forms: strongest silhouette + 1-3 identifying details.
- supporting forms: readable mass + one variation cue.
- background: silhouette/value only.

If a detail disappears at the default camera scale, it should not carry the scene's identity.

### Color hierarchy

- strongest accent belongs to focal information.
- large surfaces use quieter colors.
- separate adjacent forms by value before adding more saturation.
- use dark materials for structural punctuation, not to turn all shadow regions black.

## 6. Map Scene IR to this repository

Tiny World Builder has two contracts:

- `world[x][z]` = semantic intent.
- `cellMeshes['x,z']` = rendered result.

Always mutate semantic world state through `setCell()`.

For compiled scenes:

- terrain composition -> `terrain` + `terrainFloors`.
- semantic objects -> `kind`.
- intensity/variation -> `floors` where the existing factory supports it.
- building silhouette -> cluster adjacency first; `buildingType` only when a deliberate one-cell variant is required.
- repeated natural variation -> extend the existing seeded factory pattern.
- camera mood -> existing ortho / soft / perspective system before adding cameras.
- atmosphere -> existing lighting/post controls before new shader code.

A compiled plan should prefer a sparse, strongly composed 8x8 board over filling all 64 cells.

## 7. Critique protocol

When the user says something looks wrong, do not immediately patch the named object.

Classify the failure first:

- `semantic`: scene reads as the wrong kind of place/object.
- `composition`: hierarchy, spacing, balance, or path is wrong.
- `silhouette`: forms are generic or proportions are wrong.
- `scale`: objects do not belong to the same world.
- `material_color`: palette/value/roughness language is wrong.
- `lighting`: geometry is fine but illumination destroys it.
- `camera`: the scene may be fine from a bad view.
- `repetition`: procedural patterns are too obvious.
- `detail`: too much, too little, or detail placed at the wrong hierarchy.
- `motion`: animation fights the visual read.

Fix the highest-level failing category before polishing lower-level categories.

## 8. Visual QA must test meaning, not just bugs

Each compiled scene/change needs 3-7 visual invariants such as:

- "market path remains the clearest directional feature from default view"
- "no two adjacent hero buildings share the same silhouette"
- "shadowed faces remain color-readable"
- "focal structure is recognizable at thumbnail scale"
- "vegetation clusters feel grouped, not evenly sprinkled"
- "the scene leaves at least one deliberate breathing-space region"

Also list failure signatures: specific visual outcomes that mean the build is wrong even if it runs.

## 9. User interaction rule

The user is allowed to speak in ore.

Good input:

- "too clean"
- "this looks like a theme park version of the thing"
- "the city should feel like it grew around this road"
- "I want the buildings to be cousins, not twins"
- "the camera feels like God instead of a person"
- "it needs more life but I don't want NPC nonsense"

Translate these without demanding technical vocabulary.

When uncertainty is material, produce 2-3 explicit interpretations in Scene IR terms and choose the least destructive one for the first pass. Do not silently invent a new aesthetic.

## 10. Definition of done

The compiler has done its job when another competent coding agent can implement the scene/change without making major unsignaled aesthetic decisions.

The implementation has done its job when the visual QA invariants pass, not merely when the code runs.
