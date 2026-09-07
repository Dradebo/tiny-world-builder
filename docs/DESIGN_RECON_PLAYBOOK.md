# Design Reconnaissance & Visual Compiler Playbook

## Purpose

This document exists because two projects exposed the same underlying problem in different media.

**ShelfPulse** improved when presentation stopped inventing product meaning. Decision truth was compiled into a renderer-neutral `VisualIntentSpec`, and only then rendered through Flint/ECharts or a fallback surface.

**Q-City / WNN** failed when visual references and aesthetic intent were translated directly into Three.js objects. Nouns survived (`chair`, `table`, `shop`, `person`) but the relationships that made the place recognizable did not.

The reusable doctrine is therefore:

```text
REALITY / ORE
    ↓
DOMAIN OR SCENE TRUTH
    ↓
RENDERER-NEUTRAL INTENT
    ↓
IMPLEMENTATION PLAN
    ↓
RENDERER
    ↓
QA AGAINST TRUTH
```

The goal is to make this workflow automatic. When it is not automatic, this document is the operating manual.

---

## Provenance: what was recovered from ShelfPulse

The exact historical list of named UI/UX skills or search-result entries used during the ShelfPulse design pass is not present in the surviving accessible artifacts. Do not fabricate that list.

What *is* preserved in ShelfPulse's later architecture is the method that the design reconnaissance produced:

- a renderer-neutral `VisualIntentSpec` upstream of chart libraries;
- a target path of `DecisionResult -> VisualIntentSpec -> Flint -> ECharts`;
- renderer failure must degrade to a useful table/statement rather than erase the decision;
- the same semantic artifact is reused by web and executive/PPTX surfaces;
- **no dashboard sprawl**;
- new dependencies are accepted only when they improve decision quality or the human ability to understand and act;
- a three-lane workflow separates solved primitives, category intelligence, and integration.

This playbook generalizes that operating pattern beyond dashboards.

---

# 1. The Three-Lane Design Recon Model

## Lane 1 — Technical bill of materials

Ask:

- What renderer/runtime already exists?
- What primitives already exist?
- What geometry/material/camera/interaction capabilities are solved?
- What reusable repos, libraries, assets, shaders, helpers, or patterns already exist?
- What performance/runtime constraints are real?

Output:

- capability inventory;
- donor/primitives shortlist;
- explicit technical constraints;
- things that should **not** be rebuilt.

This lane answers **what can be executed**.

## Lane 2 — Discipline / category intelligence

Ask:

- What professional discipline owns the judgment we are currently missing?
- What vocabulary do practitioners in that discipline use?
- What reference breakdowns, tutorials, skills, portfolios, repos, talks, or documents expose the hidden intermediate decisions?
- What does "good" look like in this category?
- What recurring failure modes do experts recognize instantly?

For UI work this may include:

- information architecture;
- interaction design;
- product design;
- data visualization;
- accessibility;
- visual hierarchy;
- progressive disclosure;
- state/error design.

For 3D/world work this may include:

- environment art;
- technical art;
- production design;
- cinematography;
- set dressing;
- architectural visualization;
- procedural modeling;
- lighting;
- animation / rigging;
- game level composition.

Output:

- vocabulary map;
- category expectations;
- visual/interaction invariants;
- anti-patterns;
- reference-derived constraints.

This lane answers **what the execution must mean**.

## Lane 3 — Integration

Only integrate Lane 1 primitives that survive Lane 2 judgment.

Do not ask the renderer to invent missing domain meaning.

Output:

- renderer-neutral intent spec;
- implementation mapping;
- acceptance tests;
- fallback/degradation behavior.

This lane answers **how meaning becomes implementation without being lost**.

---

# 2. Skill-Gap Trigger

Pause implementation and perform Design Recon when any of these occur:

- "Technically that is what I asked for, but why does it look like that?"
- the user can reject an output immediately but the agent cannot name the failure precisely;
- repeated visual tweaks oscillate between too much and too little;
- the renderer is being tuned before composition/meaning is stable;
- a project has abundant references but results still feel generic;
- the agent keeps adding objects/features to solve a hierarchy problem;
- one medium works (e.g. prose/spec) but the rendered result loses the idea;
- the same correction recurs across iterations.

The presence of a skill gap is not a request for more random inspiration. It is a request for a missing **judgment layer**.

---

# 3. Design Recon Search Protocol

## Step 1 — Name the blocked judgment

Examples:

- "The scene has all the right objects but does not feel like the place."
- "The dashboard contains the metrics but the decision is buried."
- "The character looks animated but not socially alive."
- "The camera proves geometry but destroys the intended intimacy."

Do not search yet.

## Step 2 — Map the judgment to disciplines

Example:

| Blocked judgment | Likely discipline |
|---|---|
| Scene lacks lived-in spatial logic | environment art / production design / set dressing |
| Camera feels like surveillance | cinematography / virtual production |
| Repeated forms feel synthetic | procedural modeling / environment art |
| UI shows data but not decision | product design / information architecture / data viz |
| Character movement feels robotic | animation / acting / motion design |
| Material looks "gamey" | technical art / lighting / material authoring |

## Step 3 — Search for *mechanisms*, not vibes

Search targets should include:

- practitioner skills and runbooks;
- breakdowns of finished work;
- implementation tutorials;
- donor repos;
- style/production bibles;
- conference talks;
- postmortems;
- professional vocabulary;
- QA/checklists.

A good search returns statements that can become constraints, such as:

- use a human-scale reference during blockout;
- preserve focal hierarchy before set dressing;
- separate foreground/midground/background;
- expose uncertainty near the action it affects;
- use progressive disclosure instead of persistent dashboard density;
- repeated assets need controlled variation rather than unconstrained randomness.

## Step 4 — Extract a vocabulary map

Convert raw user language into professional terms and implementation consequences.

Example:

```text
"It feels like a model from above"
    → elevated observer / diorama camera
    → camera psychology + lens/elevation problem
    → create human-eye reference camera
    → acceptance: seated viewer reads room relationships without orbiting
```

## Step 5 — Freeze a renderer-neutral intent contract

The contract must describe meaning before implementation.

For interfaces:

```text
DecisionResult -> VisualIntentSpec -> renderer
```

For worlds:

```text
Reference/Ore -> SceneTruthSpec -> SceneIntentSpec -> renderer
```

If changing Three.js to Blender, or ECharts to another chart library, would force rewriting the *meaning* layer, the contract is too renderer-specific.

## Step 6 — Map intent to implementation

Use an escalation ladder:

1. rearrange composition using existing primitives;
2. change existing parameters;
3. create a reusable primitive recipe;
4. create a new semantic object kind;
5. change material/shader/renderer behavior;
6. introduce authored external assets;
7. change the authoring pipeline only when earlier levels cannot express the intent.

## Step 7 — QA against the original truth

Do not ask "does it look better?"

Ask whether explicit invariants survived.

---

# 4. The Relationship-Preservation Rule

**Preserving nouns is not enough. Preserve relationships.**

A scene may contain:

- a table;
- chairs;
- a counter;
- bottles;
- people;
- a shop.

…and still completely fail to represent the source place.

The compiler must preserve relationships such as:

- scale;
- distance;
- adjacency;
- orientation;
- density;
- occlusion;
- depth;
- hierarchy;
- repetition/variation;
- material contrast;
- light direction;
- camera-to-subject relationship;
- functional use of space.

For UI, the equivalent relationships include:

- priority;
- causality;
- decision-to-evidence linkage;
- state-to-action linkage;
- confidence;
- progressive disclosure;
- sequencing.

This is the core reusable lesson from ShelfPulse and WNN.

---

# 5. Scene Truth Before Scene Style

Before writing geometry, record observable facts separately from interpretation.

Example:

```yaml
observed:
  - table top is approximately at seated elbow height
  - mixed wood and plastic chairs coexist
  - stock remains visible behind the social area
  - exterior paving continues beyond the seating zone
  - late-afternoon sun enters from camera-right

interpreted:
  - space feels accumulated rather than designed
  - commerce and congregation coexist
  - visual warmth comes from sunlight and wood, not global orange tint
```

Do not silently convert an interpretation into a fabricated fact.

---

# 6. Failure Policy — adapted from ShelfPulse

## DEGRADE

Proceed with visibly reduced fidelity when the missing information is non-critical and the core read survives.

Examples:

- exact brand label unavailable;
- background neighboring unit simplified;
- tertiary prop omitted.

## QUARANTINE

Isolate an element when proceeding would require guessing in a way that could corrupt the scene.

Examples:

- donor character rig compatibility unknown;
- seat/pose cannot be verified;
- uncertain asset scale;
- material pipeline behaves unpredictably.

Use a neutral proxy instead.

## REJECT

Refuse the visual version when a core invariant is violated.

Examples:

- human-scale relationship is broken;
- camera contradicts intended viewer position;
- primary read changes from shop to studio/bar;
- critical commerce context disappears;
- generated geometry produces obvious rig/mesh explosions.

Do not polish a rejected composition.

---

# 7. Static Truth Before Behavior

For 3D work, use this sequence:

```text
scale
→ spatial relationships
→ silhouette
→ camera
→ material/value hierarchy
→ lighting
→ set dressing
→ static characters/proxies
→ animation
→ editorial behavior
→ effects
```

Animation cannot rescue wrong spatial truth.

A spectacular shader cannot rescue wrong scale.

A camera system cannot rescue a set that is unreadable from human eye height.

---

# 8. Camera Has Two Jobs

## Camera as measurement instrument

Before cinematic cameras, create fixed truth cameras:

- seated human eye;
- standing human eye;
- optional plan/debug view.

These are QA instruments.

## Camera as editorial device

Only after truth cameras pass should the production camera grammar be authored:

- MASTER;
- HOST;
- CO-ANCHOR;
- TWO-SHOT;
- WITNESS;
- HUNT;
- CRT;
- VERTICAL.

Do not use a flattering editorial camera to hide a broken scene.

---

# 9. No Scene Sprawl

ShelfPulse had **no dashboard sprawl**.

Q-City/WNN gets the matching rule:

**No scene sprawl.**

Do not add a city to fix a shop.
Do not add more props to fix composition.
Do not add more animation to fix scale.
Do not add a new renderer to fix missing art direction.

Build only what the camera and interaction need to prove the intended experience.

---

# 10. QA Contract Template

Every visual build should define:

```yaml
must_read_as: []
must_not_read_as: []
scale_invariants: []
composition_invariants: []
camera_invariants: []
material_light_invariants: []
interaction_invariants: []
failure_signatures: []
```

Example:

```yaml
must_read_as:
  - local shopfront first
  - social gathering point second
  - WNN set third
must_not_read_as:
  - purpose-built studio
  - nightclub
  - cute generic village
camera_invariants:
  - one hero frame works from seated eye height
  - shop context remains legible in two-shot
failure_signatures:
  - furniture becomes visually microscopic
  - any donor mesh explodes or stretches
  - commerce disappears behind set dressing
```

---

# 11. Definition of a Successful Recon Pass

Design Recon is complete when:

1. the missing judgment is named;
2. the relevant professional vocabulary is known;
3. references have been decomposed into observable relationships;
4. a renderer-neutral intent contract exists;
5. solved primitives are mapped to that contract;
6. uncertain elements have explicit degrade/quarantine/reject behavior;
7. QA invariants can falsify a bad implementation;
8. implementation can begin without the renderer making major unsignaled aesthetic decisions.

Then stop researching and build.

---

# 12. Governing Principle

**Borrow implementations. Own ontology. Preserve relationships.**

ShelfPulse proved this for decision interfaces.
Q-City/WNN must prove it for worlds.
