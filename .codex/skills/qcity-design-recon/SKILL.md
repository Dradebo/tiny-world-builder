---
name: qcity-design-recon
description: Use before implementing aesthetic, spatial, cinematic, visual-hierarchy, or worldbuilding changes when references/intent are rich but the renderer risks inventing the missing design judgment.
---

# Q-City Design Recon

Read `docs/DESIGN_RECON_PLAYBOOK.md` before changing visual code.

## Core rule

Do not compile raw aesthetic language directly into renderer objects.

Use:

```text
ORE / REFERENCES
→ OBSERVED SCENE TRUTH
→ PROFESSIONAL VOCABULARY
→ RENDERER-NEUTRAL INTENT
→ IMPLEMENTATION MAPPING
→ RENDER
→ QA AGAINST ORIGINAL TRUTH
```

The goal is not to preserve object nouns. Preserve **relationships**: scale, adjacency, hierarchy, spacing, depth, repetition, occlusion, material/value contrast, light direction, and camera psychology.

## Trigger this skill when

- the user says the output is technically correct but visually wrong;
- repeated tweaks oscillate without converging;
- reference images are plentiful but results stay generic;
- the agent cannot precisely name why a scene looks wrong;
- new objects/effects are being added to solve a composition problem;
- animation or shaders are being tuned before static scale/spatial truth passes.

## Workflow

1. **Recover evidence first**
   - source references;
   - prior screenshots/renders;
   - the conversation/spec that produced them;
   - current implementation code.

2. **Separate observed facts from interpretation**
   - Never fabricate a visual fact to fill a gap.

3. **Name the missing discipline**
   - environment art, production design, cinematography, set dressing, technical art, animation, procedural modeling, UX, information architecture, etc.

4. **Perform finite design reconnaissance**
   - search practitioner skills/runbooks/tutorials/breakdowns/repos only until the missing judgment can be expressed as constraints;
   - extract mechanisms and vocabulary, not style cosplay.

5. **Create/fill the Scene Intent contract**
   - must-read-as;
   - must-not-read-as;
   - scale relationships;
   - composition hierarchy;
   - camera job;
   - shape/repetition language;
   - material/value/light rules;
   - implementation escalation plan;
   - QA invariants;
   - failure signatures.

6. **Use the escalation ladder**
   1. composition with existing primitives;
   2. parameter changes;
   3. reusable primitive recipe;
   4. new semantic object kind;
   5. renderer/material/shader change;
   6. authored external assets;
   7. authoring-pipeline change.

7. **Apply failure policy**
   - DEGRADE: omit/simplify noncritical detail;
   - QUARANTINE: use a neutral proxy when a visual dependency would require guessing;
   - REJECT: stop polishing when a core visual invariant fails.

8. **Static truth before behavior**
   - scale → space → silhouette → camera → materials/value → light → dressing → static characters → animation → editorial effects.

9. **Truth cameras before cinematic cameras**
   - seated human-eye reference;
   - standing human-eye reference;
   - cinematic camera pack only after these pass.

10. **No scene sprawl**
    - Do not build a city to fix a shop.
    - Do not add props to fix hierarchy.
    - Do not add animation to fix scale.
    - Do not change renderer to compensate for missing art direction.

## Acceptance

A coding agent should be able to implement the visual request without making major unsignaled aesthetic decisions.

If that is not true, the recon/intent layer is incomplete. Do not code yet.
