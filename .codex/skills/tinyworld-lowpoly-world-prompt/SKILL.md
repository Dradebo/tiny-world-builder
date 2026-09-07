---
name: tinyworld-lowpoly-world-prompt
description: Use when editing Tiny World Builder prompts, model-generated worlds, Auto suggestions, or any model behavior that should create coherent low-poly 3D board scenes.
---

# Tiny World Low-Poly World Prompting

The built-in model should act like a compact low-poly diorama designer, not a random tile filler.

## Visual compiler dependency

If the request contains aesthetic, cultural, spatial, cinematic, emotional, reference-based, or "this-but-not-that" language, first apply `.codex/skills/tinyworld-visual-compiler/SKILL.md`.

The Scene IR produced by that skill is the art-direction authority. This prompting skill is only responsible for compressing the compiled visual grammar into the board/world JSON that the current builder can execute.

Do not silently replace a specific compiled aesthetic with a generic "pleasant low-poly village" prior.

## Prompt principles

- Start from the compiled `scene_thesis` and `must_read_as` constraints, not merely a generic scene category.
- Preserve `must_not_read_as` as negative prompt constraints.
- Use `focal_hierarchy`, `density_gradient`, `path_flow`, and `negative_space` to decide cell occupancy before choosing object types.
- Use strong silhouettes: tall/short contrast, clustered houses, towers, hills, trees, walls, and clear negative space.
- Make terrain do composition work: paths lead the eye, water creates crossings, dirt groups crops, grass gives breathing room.
- Use adjacency intentionally: house clusters merge, fences connect, bridges belong on water crossings, crops form fields.
- Translate `variation_amplitude` into restrained floors, cluster shape, seeded variants, and spacing changes rather than visual noise.
- Avoid noise: do not fill all 64 cells; leave deliberate open cells and visible paths unless high occupancy is explicitly compiled.
- Use `floors` as variation/intensity, including terrain stacking and object detail.
- Use forced `buildingType` only when a distinct one-cell silhouette is wanted; otherwise leave houses as `buildingType: null` so cluster logic can work.
- Keep output strictly machine-parseable JSON matching the schema.

## Composition pass before JSON

Before emitting coordinates, mentally divide the 8x8 board into:

1. focal zone,
2. support zone(s),
3. circulation / eye-flow zone,
4. breathing-space zone,
5. optional foreground/background framing zone.

Then populate cells. Do not independently sample each tile.

## For Auto suggestions

- Return candidate actions, not coordinates.
- Suggestions should be reusable across several placements.
- Rank suggestions by what best strengthens the current Scene IR invariant, not by novelty.
- Include a varied batch when useful: one structural option, one terrain/path option, one nature/detail option, and one intensify/repeat option.
- Do not suggest decorative detail if the current failure is composition, silhouette, scale, camera, or lighting.
