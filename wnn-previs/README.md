# WNN Previs Spike

A deliberately small Three.js previsualization lab for testing WNN set geometry and production decisions before shoot day.

## Sprint 0A acceptance

- WNN room renders in-browser
- selectable table / CRT / set dressing / actor proxies
- move / rotate / scale via TransformControls
- orbit camera
- GLB/GLTF import for proof-of-concept props
- browser-local save/load of transforms

## Run

```bash
cd wnn-previs
npm install
npm run dev
```

## Next

Sprint 0B adds named WNN camera presets, smooth camera transitions, lighting states, CRT/headline swaps, and 16:9 / 9:16 guides.

## Donor note

The architecture is intentionally informed by the previously audited `MrBlueBlobGuy/becor` mechanics: simple room generation, GLTF loading, transform controls, and scene persistence. We are not copying its full interior-design product shell.
