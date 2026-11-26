Drop real glTF binary models (.glb) here and point a slot in js/config.js -> models at them, e.g.

  models: { house: "assets/models/house.glb", scale: "assets/models/scale.glb", ... }

Slots: house, scale, services, process, projects, about, contact.
Units: metres, Y up, model resting on y = 0. Each model is lit by the scene's HDRI / studio
environment and casts soft shadows. While a slot is null or the file is missing, the built-in
procedural 3D model is shown instead.
