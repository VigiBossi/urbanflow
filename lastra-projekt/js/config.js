/* =========================================================
   LASTRA PROJEKT – SITE CONFIG
   Edit everything here. Items marked TODO are PLACEHOLDERS.
   ========================================================= */
window.SITE = {
  name: "Lastra Projekt",
  phone: "+389 XX XXX XXX",          // TODO: real phone number (display)
  phoneLink: "+38900000000",          // TODO: real phone, digits only with country code
  whatsapp: "38900000000",            // TODO: WhatsApp number, digits only, no "+"
  email: "info@example.com",          // TODO: real email address
  address: "Gostivar, North Macedonia", // TODO: real street address
  facebook: "https://www.facebook.com/LastraProjekt1",
  mapEmbed: "https://www.openstreetmap.org/export/embed.html?bbox=20.86%2C41.77%2C20.94%2C41.82&layer=mapnik&marker=41.7961%2C20.9087",
  stats: { years: 10, houses: 50, satisfaction: 100 }, // TODO: real numbers
  /* Projects – TODO: replace with real projects & photos.
     Text fields are {sq, mk, en}. status: "finished" | "progress".
     Image paths point to .jpg; the site automatically serves the optimised .webp (+ -800.webp) next to it. */
  projects: [
    { id: "vila-cellopek", status: "finished", size: 240, year: 2024,
      title: { sq: "Vila moderne në Çellopek", mk: "Модерна вила во Челопек", en: "Modern villa in Çellopek" },
      location: { sq: "Çellopek, Gostivar", mk: "Челопек, Гостивар", en: "Çellopek, Gostivar" },
      desc: { sq: "Shtëpi familjare me dy kate, e ndërtuar çelës në dorë, me xhama të mëdhenj dhe oborr.", mk: "Двокатна семејна куќа, изградена „клуч на рака“, со големи стакла и двор.", en: "Two-storey family home built turnkey, with large glazing and a garden." },
      cover: "assets/img/lastra-finished.jpg",
      gallery: ["assets/img/lastra-finished.jpg","assets/img/lastra-construction.jpg"],
      phases: { before: "assets/img/img7.jpg", during: "assets/img/lastra-construction.jpg", after: "assets/img/lastra-finished.jpg" },
      compare: true /* show the during/after slider – only for projects where both photos show the same house */ },
    { id: "shtepi-gostivar", status: "finished", size: 180, year: 2023,
      title: { sq: "Shtëpi minimaliste në Gostivar", mk: "Минималистичка куќа во Гостивар", en: "Minimalist house in Gostivar" },
      location: { sq: "Gostivar", mk: "Гостивар", en: "Gostivar" },
      desc: { sq: "Linja të pastra, tarracë e madhe dhe efikasitet i lartë energjetik.", mk: "Чисти линии, голема тераса и висока енергетска ефикасност.", en: "Clean lines, a large terrace and high energy efficiency." },
      cover: "assets/img/img2.jpg",
      gallery: ["assets/img/img2.jpg","assets/img/img4.jpg","assets/img/img11.jpg","assets/img/img10.jpg"],
      phases: { before: "assets/img/img7.jpg", during: "assets/img/img12.jpg", after: "assets/img/img2.jpg" } },
    { id: "rezidenca-vrapcishte", status: "progress", size: 300, year: 2026,
      title: { sq: "Rezidencë familjare (në ndërtim)", mk: "Семејна резиденција (во изградба)", en: "Family residence (in progress)" },
      location: { sq: "Rajoni i Gostivarit", mk: "Гостиварски регион", en: "Gostivar region" },
      desc: { sq: "Konstruksioni përfundoi, tani punohet çatia dhe fasada.", mk: "Конструкцијата е завршена, сега се работи покривот и фасадата.", en: "Structure complete; roof and façade are now underway." },
      cover: "assets/img/img8.jpg",
      gallery: ["assets/img/img8.jpg","assets/img/img6.jpg","assets/img/img12.jpg","assets/img/img3.jpg"],
      phases: { before: "assets/img/img7.jpg", during: "assets/img/img8.jpg", after: "assets/img/img3.jpg" } }
  ]
};
