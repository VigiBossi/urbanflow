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

  /* ---- the architect (home page "The Architect" section) ----
     PLACEHOLDERS – replace these values:
       name: a value starting with "TODO" is never shown; the section reads "Lastra Projekt's architect" instead.
       photo: "" shows the framed architectural drawing; set e.g. "assets/img/architect.jpg" (portrait, 4:5, ≥ 1000 px wide).
       experienceYears: 0 hides the years badge; set the real number (e.g. 12) to show "12+ years".
     role / quote / bio / specialties are localised {sq, mk, en}; edit them freely. */
  architect: {
    name: "TODO Emri Mbiemri",           // e.g. "Arb. Filan Filani"
    photo: "",                           // e.g. "assets/img/architect.jpg"
    experienceYears: 0,                  // e.g. 12
    role: {
      sq: "Arkitekt i diplomuar · Drejtues i projektimit",
      mk: "Дипломиран архитект · Раководител на проектирање",
      en: "Graduate architect · Head of design"
    },
    quote: {
      sq: "Një shtëpi e mirë vizatohet një herë – dhe ndërtohet saktësisht ashtu siç është vizatuar.",
      mk: "Добрата куќа се црта еднаш – и се гради точно онака како што е нацртана.",
      en: "A good house is drawn once – and built exactly the way it was drawn."
    },
    bio: {
      sq: "Te Lastra Projekt projektimi dhe ndërtimi janë nën një çati. Arkitekti që vizaton shtëpinë tuaj e ndjek atë edhe në kantier – nga skica e parë dhe lejet, deri në ditën kur merrni çelësat. Pa ndërmjetës, pa humbje informacioni mes zyrës dhe kantierit.",
      mk: "Во Lastra Projekt проектирањето и градбата се под ист покрив. Архитектот што ја црта вашата куќа ја следи и на градилиштето – од првата скица и дозволите, до денот кога ги добивате клучевите. Без посредници, без губење информации меѓу канцеларијата и градилиштето.",
      en: "At Lastra Projekt, design and construction sit under one roof. The architect who draws your house also follows it on site – from the first sketch and the permits to the day you receive the keys. No middlemen, nothing lost between the studio and the site."
    },
    specialties: {
      sq: [
        { t: "Koncept arkitektonik & vizualizim 3D", d: "Plane, fasada dhe pamje 3D që i shihni para se të fillojë ndërtimi." },
        { t: "Leje & koordinim konstruktiv", d: "Dokumentacioni, lejet dhe bashkëpunimi me inxhinierin konstruktiv." },
        { t: "Mbikëqyrje në kantier deri te çelësi", d: "Kontroll i rregullt i punimeve, nga themeli deri te dorëzimi." }
      ],
      mk: [
        { t: "Архитектонски концепт и 3D визуелизација", d: "Основи, фасади и 3D приказ што ги гледате пред да почне градбата." },
        { t: "Дозволи и конструктивна координација", d: "Документација, дозволи и соработка со градежниот инженер." },
        { t: "Надзор на градилиште до клуч на рака", d: "Редовна контрола на работите, од темел до предавање." }
      ],
      en: [
        { t: "Conceptual design & 3D visualisation", d: "Plans, elevations and 3D views you see before construction starts." },
        { t: "Permits & structural coordination", d: "Documentation, permits and close work with the structural engineer." },
        { t: "On-site supervision to turnkey", d: "Regular inspection of the works, from the foundation to handover." }
      ]
    }
  },

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
