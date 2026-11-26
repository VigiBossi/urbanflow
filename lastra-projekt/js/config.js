/* =========================================================
   LASTRA PROJEKT – SITE CONFIG (edit everything here)
   ---------------------------------------------------------
   Contact channels: while a value still looks like a placeholder
   (contains "X", "example." or 6+ zeros) the site hides that channel
   everywhere and routes the forms through Facebook Messenger instead.
   Enter the real values and WhatsApp / phone / e-mail switch on
   automatically – the floating WhatsApp button, the estimator's
   "Send specs via WhatsApp" and the consultation form included.
   ========================================================= */
window.SITE = {
  name: "Lastra Projekt",

  /* ---- contact ---- */
  phone: "+389 XX XXX XXX",            // display format, e.g. "+389 70 123 456"
  phoneLink: "+38900000000",           // digits with country code, e.g. "+38970123456"
  whatsapp: "38900000000",             // digits only, no "+", e.g. "38970123456"
  email: "info@example.com",           // e.g. "info@lastraprojekt.mk"
  address: "Gostivar, North Macedonia",// office street address
  officeHours: { sq: "E hënë – e shtunë, 08:00 – 17:00", mk: "Понеделник – сабота, 08:00 – 17:00", en: "Monday – Saturday, 08:00 – 17:00" },
  facebook: "https://www.facebook.com/LastraProjekt1",
  instagram: "",                       // e.g. "https://www.instagram.com/lastraprojekt" (empty = hidden)
  mapEmbed: "https://www.openstreetmap.org/export/embed.html?bbox=20.86%2C41.77%2C20.94%2C41.82&layer=mapnik&marker=41.7961%2C20.9087",
  stats: { years: 10, houses: 50, satisfaction: 100 },

  /* ---- 3D ----
     Optional real model: put a glTF binary at assets/models/house.glb and set the path here.
     It is offered as a third model in the 3D switcher; if it is missing or fails to load,
     the procedural villa / residence stay in place. Units: metres, Y up, ground at y = 0. */
  glbModel: null,                      // e.g. "assets/models/house.glb"

  /* ---- turnkey estimator ----
     Duration (months) = base + size × perM2 (+ extraFloor for 2 floors).
     The result is shown as a ±range and is always labelled indicative. */
  estimator: {
    min: 120, max: 400, step: 10, start: 180,
    range: 1,                                  // ± months shown around the estimate
    tiers: {
      structure: { base: 2.5, perM2: 0.012, extraFloor: 1.0, items: ["d_design", "d_permits", "d_found", "d_frame", "d_walls", "d_roofslab"] },
      standard:  { base: 5.0, perM2: 0.018, extraFloor: 1.5, items: ["d_design", "d_permits", "d_found", "d_frame", "d_walls", "d_roof", "d_windows", "d_facade", "d_install", "d_floors", "d_keys"] },
      premium:   { base: 6.5, perM2: 0.024, extraFloor: 2.0, items: ["d_design", "d_permits", "d_found", "d_frame", "d_walls", "d_roof", "d_windows3", "d_facade_p", "d_install_p", "d_floors_p", "d_land", "d_light", "d_keys"] }
    }
  },

  /* ---- projects ----
     Text fields are {sq, mk, en}. status: "finished" | "progress".
     Image paths point to .jpg; the site serves the optimised .webp (+ -800.webp) next to it.
     phases: one photo per build phase shown as tabs in the project modal. */
  projects: [
    { id: "vila-cellopek", status: "finished", size: 240, year: 2024,
      title: { sq: "Vila moderne në Çellopek", mk: "Модерна вила во Челопек", en: "Modern villa in Çellopek" },
      location: { sq: "Çellopek, Gostivar", mk: "Челопек, Гостивар", en: "Çellopek, Gostivar" },
      desc: { sq: "Shtëpi familjare me dy kate, e ndërtuar çelës në dorë, me xhama të mëdhenj dhe oborr.", mk: "Двокатна семејна куќа, изградена „клуч на рака“, со големи стакла и двор.", en: "Two-storey family home built turnkey, with large glazing and a garden." },
      cover: "assets/img/lastra-finished.jpg",
      gallery: ["assets/img/lastra-finished.jpg", "assets/img/lastra-construction.jpg"],
      phases: { before: "assets/img/img7.jpg", during: "assets/img/lastra-construction.jpg", after: "assets/img/lastra-finished.jpg" },
      compare: true /* show the during/after slider – only where both photos show the same house */ },
    { id: "shtepi-gostivar", status: "finished", size: 180, year: 2023,
      title: { sq: "Shtëpi minimaliste në Gostivar", mk: "Минималистичка куќа во Гостивар", en: "Minimalist house in Gostivar" },
      location: { sq: "Gostivar", mk: "Гостивар", en: "Gostivar" },
      desc: { sq: "Linja të pastra, tarracë e madhe dhe efikasitet i lartë energjetik.", mk: "Чисти линии, голема тераса и висока енергетска ефикасност.", en: "Clean lines, a large terrace and high energy efficiency." },
      cover: "assets/img/img2.jpg",
      gallery: ["assets/img/img2.jpg", "assets/img/img4.jpg", "assets/img/img11.jpg", "assets/img/img10.jpg"],
      phases: { before: "assets/img/img7.jpg", during: "assets/img/img12.jpg", after: "assets/img/img2.jpg" } },
    { id: "rezidenca-vrapcishte", status: "progress", size: 300, year: 2026,
      title: { sq: "Rezidencë familjare (në ndërtim)", mk: "Семејна резиденција (во изградба)", en: "Family residence (in progress)" },
      location: { sq: "Rajoni i Gostivarit", mk: "Гостиварски регион", en: "Gostivar region" },
      desc: { sq: "Konstruksioni përfundoi, tani punohet çatia dhe fasada.", mk: "Конструкцијата е завршена, сега се работи покривот и фасадата.", en: "Structure complete; roof and façade are now underway." },
      cover: "assets/img/img8.jpg",
      gallery: ["assets/img/img8.jpg", "assets/img/img6.jpg", "assets/img/img12.jpg", "assets/img/img3.jpg"],
      phases: { before: "assets/img/img7.jpg", during: "assets/img/img8.jpg", after: "assets/img/img3.jpg" } }
  ]
};
