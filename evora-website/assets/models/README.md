# Optional real 3D models

Every showcase slot renders a high-detail procedural model by default. To use a
real model instead, drop a `.glb` file here named after the slot and list the
slot id in `manifest.json`. No rebuild is needed.

| Slot id   | Showcase product      |
| --------- | --------------------- |
| `basin`   | Basin & Faucet        |
| `shower`  | Rain Shower           |
| `vanity`  | Vanity & Mirror       |
| `bathtub` | Bathtub               |
| `tiles`   | Tile Wall             |
| `wc`      | Wall-hung WC          |

Example: add `assets/models/bathtub.glb`, then set

```json
{ "models": ["bathtub"] }
```

The model is scaled and placed onto the procedural model's footprint. Hotspots
and dimensions are remapped to its bounds. Mesh/material names are matched to
the live finish system: names containing `chrome`, `brass`, `metal`, `tap`,
`spout`… use the metal finish; `ceramic`, `basin`, `tub`… use the ceramic finish;
`marble`, `stone`, `tile`, `top`… use the stone finish; and `glass`, `mirror`
and `wood` get their matching materials. Anything else keeps its own material.

Real models are only fetched when the site is served over http(s). Opened from
`file://`, the procedural models are used and no requests are made.
