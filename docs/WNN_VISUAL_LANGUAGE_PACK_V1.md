# WNN Visual Language Pack v1

## Purpose

This document is the production-facing bridge between:

- `docs/DESIGN_RECON_PLAYBOOK.md` — the reusable method;
- `docs/WNN_PREVIS_FORENSIC_RESCUE.md` — the failure analysis;
- `wnn-previs/src/rescueMain.ts` — the current Three.js rescue implementation.

The forensic report explains what went wrong. This pack defines what WNN must look and move like before implementation is allowed to improvise.

The governing thesis is:

> **A found neighborhood shopfront / kafunda lightly weaponized into a WNN sports-news conversation set. The place must read as real local congregation first, show set second.**

The renderer may simplify geometry. It may not simplify the relationships that make the place legible.

---

# 1. Scene Identity

## Must read as

1. an existing local shop / duka;
2. a small kafunda / congregation point attached to commerce;
3. a place regulars already use;
4. WNN temporarily inhabiting and redirecting that place;
5. warm, informal, slightly chaotic social territory;
6. a set that could plausibly be packed down and leave the shop behind.

## Must not read as

- purpose-built TV studio;
- podcast studio with decorative African props;
- nightclub or polished bar;
- tourist-market / village-theme cliché;
- sterile symmetrical panel show;
- generic low-poly diorama;
- an entire trading centre built to prove one shop.

## Story evidence that earns the read

Primary evidence:

- open shop mouth / threshold;
- counter + stocked shelves;
- grille / metal security frame;
- folding wooden table;
- mixed chair families;
- stacked extra chairs;
- exterior paving spilling into the social area.

Secondary evidence:

- bottle / crate traces;
- broom / bucket / cleanup residue;
- modest CRT / WNN screen cue;
- small sports/news signage or clock;
- one neighboring-context hint, never a full street build.

## Composition hierarchy

Default hierarchy:

```text
1. host / co-host social table
2. shop counter + stocked wall
3. WNN screen / CRT cue
4. witness / extra seat
5. stacked chairs + residue
6. tertiary bottles / crates / broom / bucket
```

Target occupancy: approximately `0.60–0.68`.

Target asymmetry: high. The frame should feel accumulated, not laid out by a showroom designer.

Depth should resolve into at least three useful layers:

```text
foreground evidence
→ hero social plane
→ commerce / shop proof
```

The set should be denser toward shop stock and looser around the hero conversational area.

---

# 2. Primitive Families

The rule for procedural geometry is:

> **Preserve the recognition-bearing silhouette before adding detail.**

## Canonical physical anchors

Use these as internal consistency anchors, not survey measurements:

```text
human height        1.70–1.78 m
seat height         0.43–0.47 m
table height        0.72–0.76 m
counter height      0.95–1.05 m
door / grille       2.00–2.20 m
bottle height       0.23–0.30 m
```

A primitive that violates these relationships should fail QA even if it is individually attractive.

## 2.1 Wooden folding chair

Must preserve:

- clear seat plane;
- slatted or visibly segmented back;
- crossed / folding leg logic;
- narrow, ordinary proportions;
- credible seat height;
- slight wear / non-uniformity later through material variation.

Forbidden shortcut:

- generic dining chair block;
- stool silhouette;
- chair reduced to seat + vertical rectangle with no folding logic.

## 2.2 Wooden folding table

Must preserve:

- thin/slatted top rather than a luxury slab;
- foldable support logic;
- ordinary social scale for two to four people;
- enough underside structure to read from seated camera height.

Forbidden shortcut:

- boardroom table;
- café pedestal table;
- pristine monolithic block.

## 2.3 Plastic chair family

Must preserve:

- broad molded seat;
- recognizable back;
- four-leg or molded-support silhouette;
- stackability.

Stacked chairs must still read as chairs in silhouette. Repetition is allowed; exact cloning is not.

Controlled stack variation:

- slight vertical offset;
- tiny yaw differences;
- minor front/back drift;
- no random rotations that make the stack physically impossible.

## 2.4 Counter + shelf family

Counter must read as commerce infrastructure first, WNN furniture never.

Shelves should use:

- repeated horizontal rhythm;
- controlled stock density;
- varied bottle/package heights;
- visible gaps;
- non-perfect alignment;
- darker shop depth behind stock.

Do not procedurally fill every shelf cell. Density should imply inventory, not voxel noise.

## 2.5 Grille / door / threshold family

This family carries the open-shop grammar.

Sequence to preserve:

```text
forecourt paving
→ tile / threshold rise
→ columns / shallow side returns
→ grille frame / opening
→ counter + stock depth
```

If all props are hidden, the architecture must still read as an open shopfront.

## 2.6 Bottle / crate family

Bottles are scale anchors and social residue, not decoration confetti.

Use small clusters with causal logic:

- one in use;
- one recently set down;
- one or two supporting background commerce / crate evidence.

Crates should live near commerce or setup residue, not as random color blocks in empty corners.

## 2.7 Residue family

Residue includes:

- broom;
- bucket;
- dustpan;
- stacked stool / spare chair;
- small cleanup / setup traces.

Residue should answer: **what happened here before the camera arrived?**

If it cannot answer that, it is probably clutter.

---

# 3. Shot Bible

Camera has two separate jobs:

1. truth measurement;
2. editorial authorship.

Truth cameras are not optional.

## REF-SEATED

**Job:** prove the place from the social height of someone sitting at the next table.

Must show:

- table / chair scale naturally;
- shop context without orbiting;
- open-front relationship;
- enough commerce to prove this is still a shop.

Failure signatures:

- god-view / diorama feeling;
- furniture looks miniature;
- counter disappears;
- frame feels like surveying a model.

## REF-STANDING

**Job:** prove human-scale architecture and threshold logic from a plausible observer position.

Must show:

- door / grille height;
- exterior-to-interior transition;
- social zone and shop depth in one understandable spatial read.

Failure signature: architecture overwhelms people/furniture or vice versa.

## MASTER

**Job:** establish shop + gathering + WNN in one frame.

Must prove all three layers without flattening them into equal priority.

Failure signature: widest view becomes least useful view.

## TWO-SHOT

**Job:** make host + co-host relationship primary while retaining room proof.

Must preserve:

- conversational geometry;
- table edge / bottle cues;
- some counter/shelf or threshold evidence.

Failure signature: generic podcast composition with all local context cropped out.

## HOST

**Job:** authority / argument / punch-line framing.

Should feel close enough for personality but not so close the kafunda disappears.

## CO-ANCHOR

**Job:** complementary intimacy / rebuttal / reaction.

Do not simply mirror HOST mechanically. Slight asymmetry should survive.

## WITNESS

**Job:** social reaction, interruption, disbelief, side-eye, "man in the room" energy.

Should feel like the camera noticed a person already present, not like a third studio guest was formally lit.

## HUNT

**Job:** nosy, searching, exploratory editorial movement through the set.

Use controlled foreground occlusion and partial reveals. Never turn it into free-orbit game camera behavior.

## CRT

**Job:** tertiary newsroom / evidence insert.

The screen should remain a cue inside the place, not become the visual thesis of the set.

## VERTICAL

**Job:** authored portrait / Shorts/Reels crop.

Must be recomposed, not merely crop a horizontal master. Preserve one unmistakable piece of place evidence in the narrow frame.

---

# 4. Table-Life Grammar

The table is the social engine of the set.

## Core prop set

Preferred table props:

- beer bottle;
- ashtray;
- cigarette;
- lighter or matchbox;
- phone;
- optional paper / score note / small cue card.

Not every prop belongs in every frame.

## Placement logic

Props should imply ownership and recent action.

Examples:

- bottle nearer the person using it, not perfectly centered;
- ashtray in shared reach zone;
- lighter near cigarette user or recently abandoned beside ashtray;
- phone slightly off-axis, face-up or face-down according to beat;
- one clear patch of table should remain visually quiet.

Avoid equal spacing. Avoid decorative rings. Avoid perfectly parallel placement.

## Causal residue

Every table state should answer one of these:

- what was just touched?
- what will probably be touched next?
- what belongs to whom?
- what has been ignored for a while?

That is how props become social evidence.

---

# 5. Material, Value and Light Language

## Base palette roles

Use role-based color, not global tinting.

```text
walls / columns      faded warm cream / dust-neutral
pavers               grey-brown / muted concrete
wood                  worn warm brown
metal / grille        charcoal / dull grey
plastic chairs        restrained green; occasional orange accent
bottles                dark green / brown
WNN accent             red / white / black in small doses
```

## Value structure

Primary rule:

> Bright exterior, shaded-but-readable shop interior.

Do not create warmth by making the whole frame brown.

Target value hierarchy:

1. exterior light / threshold catches;
2. readable faces / hero table;
3. stocked wall / counter mid-values;
4. dark metal and shop depth;
5. small accent highlights.

Crushed black interiors fail.

## Lighting language

Default source is late-afternoon side light.

Use:

- one readable directional source;
- soft enough fill to retain material identity;
- shadows that explain geometry;
- modest interior practical / bounce only if needed;
- no stage-light look by default.

Light should reveal the found place, not announce "cinematic lighting."

## Material response

Prefer rough, ordinary surfaces.

High gloss belongs only where physically justified: bottles, screen glass, small metal edges.

Variation should be controlled through:

- roughness differences;
- mild value drift;
- small wear cues;
- repetition broken through stock / furniture placement.

Do not use noise everywhere as a substitute for lived-in detail.

---

# 6. Motion Intent Starter Pack

Static truth must pass before this section is activated.

The motion doctrine is:

> **Do not add movement. Compile behavior.**

Useful practitioner lenses:

- Yuri Artiukh-style visual decomposition: identify the perceptual mechanism before coding the effect;
- Alex Grigg-style animation decomposition: make timing, spacing, pose readability, arcs, holds and accents explicit before animating.

The reusable asset is the vocabulary, not imitation of a creator's style.

## Motion compiler

```text
OBSERVED / INTENDED ACTION
→ SOCIAL OR ACTING INTENT
→ KEY POSES
→ TIMING + SPACING
→ ARCS + OVERLAP + FOLLOW-THROUGH
→ HOLDS + ACCENTS + SETTLE
→ PROCEDURAL OR CLIP IMPLEMENTATION
→ MOTION QA
```

## Global rules

- stillness is useful;
- characters must not share one idle phase;
- asymmetry is preferred to synchronized ambient loops;
- motion amplitude stays small unless the editorial beat requires escalation;
- head / eyes often lead social action;
- hands follow causal tasks, not random oscillation;
- every action needs a recoverable rest state;
- pauses and holds are part of the performance.

Forbidden default:

```text
sin(time) * amplitude
```

for the entire person or all characters at the same cadence.

## 6.1 Conversational idle

Intent: attentive presence, not visible "idle animation."

Use:

- long hold;
- tiny breathing / weight shift;
- occasional head-angle correction;
- rare hand reposition;
- nonperiodic timing.

Fail if the viewer notices a loop before noticing the conversation.

## 6.2 Beer drink

Compile as:

```text
conversational hold
→ eye/head lead
→ small wrist/elbow anticipation
→ bottle rises on an arc
→ contact pose
→ longer contact hold than travel time
→ lower with different spacing from lift
→ hand/bottle settle
→ conversational rest
```

Do not mirror the lift/lower timing exactly.

## 6.3 Smoking hold

Compile as:

```text
rest hold
→ glance / thought beat
→ hand lift
→ short contact hold
→ inhale implication
→ lowered hand or side hold
→ delayed exhale / smoke event
→ return to conversation
```

Smoke is a timing/depth cue, not stage fog.

## 6.4 Ash tap

Small action, high social value.

Use:

- tiny preparatory wrist rotation;
- short controlled arc;
- one/two quick accents;
- brief settle;
- return without dramatic flourish.

## 6.5 Glance / reaction

Head movement should usually lag the eyes slightly.

Reaction strength ladder:

```text
eyes only
→ eyes + head
→ head + shoulder
→ torso lean
→ full interruption
```

Choose the smallest readable level.

## 6.6 Witness lean-in

Intent: curiosity / disbelief / "did he really say that?"

Use:

- initial stillness;
- head lead;
- torso follows;
- slight chair/weight compression if supported;
- hold at peak;
- delayed retreat or remain in the new pose.

## 6.7 Table touch / prop adjustment

Small object contact should be motivated:

- making room;
- reclaiming own bottle;
- pushing ashtray toward another person;
- checking phone;
- punctuating a statement.

Never drift props autonomously just to make the scene feel alive.

---

# 7. Character Admission Gate

Default scene uses stable static proxies until donors earn entry.

For each donor character:

```text
1. load static
2. verify bounding height
3. verify orientation
4. verify seated placement
5. verify neutral rest pose
6. verify idle clip
7. verify sitting clip
8. verify gesture clip
9. verify wrist / hand prop mount
10. verify motion does not corrupt silhouette or scale
11. only then admit to default scene
```

Any giant limb / tube / exploded mesh / impossible seated pose is QUARANTINE, not a scene-wide debugging invitation.

---

# 8. Build Order

Use this order and resist skipping downward:

```text
primitive silhouettes
→ static scene truth
→ truth-camera proof
→ editorial shot refinement
→ material / light refinement
→ table-life placement
→ static character posing
→ micro-behavior
→ social interaction
→ editorial weirdness
→ effects
```

WNN's Eric-Andre / absurdist energy belongs near the end of the chain. Chaos is only funny when the underlying room is stable enough to violate.

---

# 9. QA Matrix

A pass must satisfy all of the following.

## Scene identity

- shopfront reads before WNN branding;
- gathering behavior is legible;
- scene does not read as designed bar/studio;
- commerce remains visible.

## Scale

- seated person, chair, table, counter and grille feel mutually credible;
- no hero object becomes microscopic from default QA cameras.

## Silhouette

- wooden chair reads as wooden folding chair;
- plastic chair reads as plastic chair;
- stacked chairs read as stacked chairs;
- counter / shelving remain recognizable in grayscale.

## Camera

- `REF-SEATED` works without orbiting;
- `REF-STANDING` proves threshold and human scale;
- editorial shots do not hide broken geometry;
- vertical framing is authored rather than cropped.

## Light/material

- bright exterior vs shaded interior relationship survives;
- warmth comes from light + materials, not global orange/brown tint;
- shadows explain geometry;
- WNN accents do not dominate the local material palette.

## Motion

- no synchronized character loops;
- every prop action has causal motivation;
- key poses are readable;
- holds exist;
- lift/lower or enter/exit timing is not mechanically mirrored;
- stillness survives between actions.

---

# 10. Failure Signatures

Reject or quarantine when any of these appear:

- god-view / miniature-diorama read;
- architecture swallows furniture;
- giant unexplained donor geometry;
- shop context disappears from hero frames;
- chair stacks become generic repeated boxes;
- global brown cave / nightclub treatment;
- perfectly symmetric prop placement;
- constant ambient motion everywhere;
- all characters breathe / sway at the same phase;
- autonomous prop drift;
- effects added before static frame truth passes;
- new renderer or city-scale build proposed to fix a local composition problem.

---

# 11. Definition of Done for v1

The WNN visual language is working when a coding agent can receive this document plus the source references and implement the next scene pass without inventing:

- what the place is;
- how large things are relative to each other;
- what each camera is for;
- why props sit where they do;
- how warmth is produced;
- how characters should move socially;
- what kinds of simplification are allowed;
- what visual failures must be rejected.

The remaining freedom should be implementation freedom, not missing art direction.

---

# Governing line

> **Beauty here is not ornament. It is the absence of visual lies.**
