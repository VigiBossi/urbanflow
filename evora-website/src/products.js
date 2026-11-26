// Catalog data. Dimensions are in centimetres; finish/material values are i18n keys.
export const CATEGORIES = ['all', 'toilets', 'sinks', 'vanities', 'faucets', 'showers', 'tiles'];

export const PRODUCTS = [
  {
    id: 'wc-lumen', cat: 'toilets', name: 'Lumen Rimless Wall-Hung WC', art: 'wcWall', dims: '52 × 36 × 35 cm',
    finish: 'finish.white', material: 'mat.vitreous', accent: 'chrome',
    desc: {
      en: 'A soft, low-slung silhouette with a rimless flush and concealed fixings — easy to clean, quiet to look at.',
      sq: 'Siluetë e butë dhe e ulët me shkarkim pa buzë dhe fiksim të fshehur — e lehtë për t’u pastruar, e qetë për syrin.',
      mk: 'Мек, низок силуетен облик со испирање без раб и скриено прицврстување — лесна за чистење, смирена за окото.',
      tr: 'Çerçevesiz sifon ve gizli montajlı yumuşak, alçak bir siluet — temizlemesi kolay, bakması huzurlu.',
    },
  },
  {
    id: 'wc-arco', cat: 'toilets', name: 'Arco Back-to-Wall WC', art: 'wcFloor', dims: '56 × 37 × 40 cm',
    finish: 'finish.glossWhite', material: 'mat.vitreous', accent: 'gold',
    desc: {
      en: 'Floor-standing and flush to the wall, with a slow-close seat and a sculpted, continuous base.',
      sq: 'Në dysheme dhe ngjitur me murin, me kapak që mbyllet ngadalë dhe bazë të skulpturuar e të vazhdueshme.',
      mk: 'Подна, прислонета до ѕидот, со капак со бавно затворање и скулптурална, непрекината основа.',
      tr: 'Duvara tam dayalı yer tipi klozet; yavaş kapanan kapak ve heykelsi, kesintisiz gövde.',
    },
  },
  {
    id: 'wc-noir', cat: 'toilets', name: 'Noir Rimless Wall-Hung WC', art: 'wcWall', dims: '54 × 36 × 33 cm',
    finish: 'finish.black', material: 'mat.vitreous', accent: 'black', body: '#262626',
    desc: {
      en: 'Matte black vitreous china in a compact projection — a graphic accent for dark, moody bathrooms.',
      sq: 'Porcelan sanitar i zi mat me projeksion kompakt — theks grafik për banjo të errëta dhe me atmosferë.',
      mk: 'Мат црн санитарен порцелан во компактна изведба — графички акцент за темни, атмосферски бањи.',
      tr: 'Kompakt derinlikte mat siyah vitrifiye — koyu ve atmosferik banyolar için grafik bir vurgu.',
    },
  },
  {
    id: 'bs-monolith', cat: 'sinks', name: 'Monolith Pedestal Basin', art: 'basinPedestal', dims: 'Ø 51 × 95 cm',
    finish: 'finish.travertine', material: 'mat.ceramic', accent: 'gold', body: '#d9c6a4',
    desc: {
      en: 'The freestanding centrepiece from our 3D studio: a single tapering column rising into a deep, rounded bowl.',
      sq: 'Pjesa qendrore e studios sonë 3D: një kolonë e vetme që hollohet dhe ngrihet në një govatë të thellë e të rrumbullakët.',
      mk: 'Самостојниот централен елемент од нашето 3D студио: еден стеснет столб што се издига во длабок, заоблен сад.',
      tr: '3D stüdyomuzun bağımsız başrolü: derin, yuvarlak bir hazneye yükselen tek parça incelen sütun.',
    },
  },
  {
    id: 'bs-ellipse', cat: 'sinks', name: 'Ellipse Countertop Basin', art: 'basinCounter', dims: '60 × 38 × 14 cm',
    finish: 'finish.white', material: 'mat.ceramic', accent: 'chrome',
    desc: {
      en: 'A thin-walled elliptical vessel with a fine 6 mm rim, made to sit on stone or wood.',
      sq: 'Lavaman eliptik me mure të holla dhe buzë 6 mm, i krijuar për t’u vendosur mbi gur ose dru.',
      mk: 'Елипсовиден сад со тенки ѕидови и фин раб од 6 mm, создаден да стои на камен или дрво.',
      tr: 'İnce 6 mm kenarlı, ince cidarlı eliptik tezgâh üstü lavabo; taş veya ahşap üzerine uygun.',
    },
  },
  {
    id: 'bs-cove', cat: 'sinks', name: 'Cove Wall Basin', art: 'basinWall', dims: '50 × 42 × 12 cm',
    finish: 'finish.black', material: 'mat.ceramic', accent: 'gold', body: '#232323',
    desc: {
      en: 'A compact wall-hung basin for guest bathrooms — pairs beautifully with brushed gold wall mixers.',
      sq: 'Lavaman kompakt i varur në mur për banjot e mysafirëve — shkon bukur me rubinetat e murit në ar të lëmuar.',
      mk: 'Компактно ѕидно лавабо за гостински бањи — одлично се спојува со ѕидни батерии од четкано злато.',
      tr: 'Misafir banyoları için kompakt asma lavabo — fırçalanmış altın ankastre bataryalarla çok yakışır.',
    },
  },
  {
    id: 'vn-atelier', cat: 'vanities', name: 'Atelier Floating Vanity 100', art: 'vanity', dims: '100 × 46 × 50 cm',
    finish: 'finish.smokedOak', material: 'mat.oak', accent: 'gold', body: '#6b5a48',
    desc: {
      en: 'Wall-hung oak cabinet with push-open drawers and an integrated travertine-tone ceramic top.',
      sq: 'Dollap lisi i varur në mur me sirtarë që hapen me shtytje dhe sipërfaqe qeramike me ton travertini.',
      mk: 'Ѕиден даб ормар со фиоки на притисок и интегрирана керамичка плоча во тон на травертин.',
      tr: 'Bas-aç çekmeceli, traverten tonlu entegre seramik tezgâhlı asma meşe dolap.',
    },
  },
  {
    id: 'vn-linea', cat: 'vanities', name: 'Linea Double Vanity 140', art: 'vanityDouble', dims: '140 × 48 × 52 cm',
    finish: 'finish.blackOak', material: 'mat.oak', accent: 'black', body: '#2b2724',
    desc: {
      en: 'A double-basin composition for shared bathrooms, with full-width drawers and a slim 12 mm top.',
      sq: 'Kompozim me dy lavamanë për banjo të përbashkëta, me sirtarë në gjithë gjerësinë dhe sipërfaqe 12 mm.',
      mk: 'Композиција со две лавабоа за заеднички бањи, со фиоки по целата ширина и тенка плоча од 12 mm.',
      tr: 'Ortak banyolar için çift lavabolu kompozisyon; tam genişlikte çekmeceler ve ince 12 mm tezgâh.',
    },
  },
  {
    id: 'fc-arch', cat: 'faucets', name: 'Arch Tall Basin Mixer', art: 'faucetTall', dims: 'H 32 · Spout 16 cm',
    finish: 'finish.gold', material: 'mat.brass', accent: 'gold',
    desc: {
      en: 'A tall single-lever mixer with a continuous arched spout, sized for countertop vessels.',
      sq: 'Rubinet i lartë me një levë dhe grykë harkore të vazhdueshme, i përshtatur për lavamanë mbi banak.',
      mk: 'Висока еднорачна батерија со непрекинат лачен излив, наменета за лавабоа на плот.',
      tr: 'Tezgâh üstü lavabolar için ölçülendirilmiş, kesintisiz kemerli ağızlı yüksek tek kollu batarya.',
    },
  },
  {
    id: 'fc-linea', cat: 'faucets', name: 'Linea Wall Mixer', art: 'faucetWall', dims: 'Spout 20 cm',
    finish: 'finish.black', material: 'mat.brass', accent: 'black',
    desc: {
      en: 'Concealed wall-mounted mixer with a slender rectangular spout and a separate minimal lever.',
      sq: 'Rubinet i murit me instalim të fshehur, grykë të hollë drejtkëndore dhe levë minimale të veçantë.',
      mk: 'Вградена ѕидна батерија со тенок правоаголен излив и посебна минималистичка рачка.',
      tr: 'İnce dikdörtgen ağızlı ve ayrı minimal kollu ankastre duvar bataryası.',
    },
  },
  {
    id: 'fc-riva', cat: 'faucets', name: 'Riva Floor-Standing Mixer', art: 'faucetFloor', dims: 'H 95 cm',
    finish: 'finish.chrome', material: 'mat.stainless', accent: 'chrome',
    desc: {
      en: 'An architectural floor-standing mixer for freestanding basins and bathtubs, with a hand shower.',
      sq: 'Rubinet arkitekturor dyshemeje për lavamanë dhe vaska të lira, me dush dore.',
      mk: 'Архитектонска подна батерија за самостојни лавабоа и кади, со рачен туш.',
      tr: 'Serbest duran lavabo ve küvetler için el duşlu, mimari zemin bataryası.',
    },
  },
  {
    id: 'sh-halo', cat: 'showers', name: 'Halo Ceiling Rain Shower Ø40', art: 'showerRain', dims: 'Ø 40 cm',
    finish: 'finish.gold', material: 'mat.brass', accent: 'gold',
    desc: {
      en: 'An ultra-thin 8 mm ceiling head delivering a soft, even rainfall across a wide area.',
      sq: 'Kokë dushi tavani shumë e hollë 8 mm që jep shi të butë dhe të njëtrajtshëm në një sipërfaqe të gjerë.',
      mk: 'Ултратенка таванска туш-глава од 8 mm што дава мек, рамномерен дожд на широка површина.',
      tr: 'Geniş bir alana yumuşak ve eşit yağmur etkisi veren ultra ince 8 mm tavan duş başlığı.',
    },
  },
  {
    id: 'sh-column', cat: 'showers', name: 'Thermostatic Shower Column', art: 'showerColumn', dims: 'H 120 · Head Ø 30 cm',
    finish: 'finish.black', material: 'mat.brass', accent: 'black',
    desc: {
      en: 'Exposed thermostatic column with overhead rain, hand shower and a safety stop at 38 °C.',
      sq: 'Kolonë dushi termostatike e jashtme me shi nga lart, dush dore dhe ndalesë sigurie në 38 °C.',
      mk: 'Надворешен термостатски туш-столб со дожд одозгора, рачен туш и безбедносен стоп на 38 °C.',
      tr: 'Tepe yağmur duşu, el duşu ve 38 °C güvenlik kilitli açık termostatik duş kolonu.',
    },
  },
  {
    id: 'sh-screen', cat: 'showers', name: 'Frameless Walk-In Screen 120', art: 'showerScreen', dims: '120 × 200 cm',
    finish: 'finish.clearBlack', material: 'mat.glass', accent: 'black',
    desc: {
      en: 'A single fixed glass panel with a fine black profile and anti-limescale coating.',
      sq: 'Panel i vetëm xhami fiks me profil të hollë të zi dhe veshje kundër gëlqeres.',
      mk: 'Единечен фиксен стаклен панел со тенок црн профил и заштита од бигор.',
      tr: 'İnce siyah profilli, kireç önleyici kaplamalı tek parça sabit cam panel.',
    },
  },
  {
    id: 't-calacatta', cat: 'tiles', name: 'Calacatta Oro Porcelain', art: 'tile', stone: 'calacatta', dims: '120 × 240 cm · 6 mm',
    finish: 'finish.polished', material: 'mat.porcelain', accent: 'gold',
    desc: {
      en: 'Book-matched large-format slabs with warm gold-grey veining for seamless walls and floors.',
      sq: 'Pllaka me format të madh me damarë të ngrohtë ari-gri, për mure dhe dysheme pa ndërprerje.',
      mk: 'Плочи со голем формат со топли златно-сиви жили, за ѕидови и подови без прекини.',
      tr: 'Kesintisiz duvar ve zeminler için sıcak altın-gri damarlı, büyük format plakalar.',
    },
  },
  {
    id: 't-travertine', cat: 'tiles', name: 'Travertino Classico', art: 'tile', stone: 'travertine', dims: '60 × 120 cm · 9 mm',
    finish: 'finish.matte', material: 'mat.porcelain', accent: 'gold',
    desc: {
      en: 'The calm strata of Roman travertine in a slip-resistant matte porcelain, indoors and out.',
      sq: 'Shtresat e qeta të travertinit romak në porcelan mat jo-rrëshqitës, për brenda dhe jashtë.',
      mk: 'Смирените слоеви на римскиот травертин во мат порцелан против лизгање, за внатре и надвор.',
      tr: 'Roma travertenin sakin katmanları, iç ve dış mekân için kaymaz mat porselende.',
    },
  },
  {
    id: 't-nero', cat: 'tiles', name: 'Nero Marquina', art: 'tile', stone: 'nero', dims: '60 × 120 cm · 9 mm',
    finish: 'finish.polished', material: 'mat.porcelain', accent: 'chrome',
    desc: {
      en: 'Deep black with crisp white veins — dramatic in powder rooms and feature walls.',
      sq: 'E zezë e thellë me damarë të bardhë të qartë — dramatike në banjo të vogla dhe mure theksi.',
      mk: 'Длабока црна со остри бели жили — драматична во мали бањи и акцентни ѕидови.',
      tr: 'Keskin beyaz damarlı derin siyah — misafir banyolarında ve vurgu duvarlarında dramatik.',
    },
  },
  {
    id: 't-verde', cat: 'tiles', name: 'Verde Alpi', art: 'tile', stone: 'verde', dims: '120 × 120 cm · 6 mm',
    finish: 'finish.polished', material: 'mat.porcelain', accent: 'gold',
    desc: {
      en: 'Forest-green marble look with a web of pale veins — pairs naturally with brushed gold.',
      sq: 'Pamje mermeri jeshil i errët me rrjet damarësh të zbehtë — shkon natyrshëm me arin e lëmuar.',
      mk: 'Изглед на шумско зелен мермер со мрежа од бледи жили — природно се спојува со четкано злато.',
      tr: 'Açık renkli damar ağıyla orman yeşili mermer görünümü — fırçalanmış altınla doğal bir uyum.',
    },
  },
  {
    id: 't-cemento', cat: 'tiles', name: 'Cemento Grigio', art: 'tile', stone: 'cemento', dims: '80 × 80 cm · 10 mm',
    finish: 'finish.matte', material: 'mat.porcelain', accent: 'black',
    desc: {
      en: 'A soft, trowelled concrete look for continuous floors from bathroom to living space.',
      sq: 'Pamje e butë betoni të lëmuar me mistri për dysheme të vazhdueshme nga banjoja te dhoma e ndenjes.',
      mk: 'Мек изглед на мистриен бетон за непрекинати подови од бањата до дневната соба.',
      tr: 'Banyodan yaşam alanına kesintisiz zeminler için yumuşak, mala izli beton görünümü.',
    },
  },
];

export const byId = (id) => PRODUCTS.find((p) => p.id === id);

// "View in 3D": which showcase model opens for each product, with its finishes
// preselected (and, for tiles, the matching stone on the feature wall).
export const VIEW_3D = {
  'wc-lumen': { model: 'wc', metal: 'chrome', ceramic: 'white' },
  'wc-arco': { model: 'wc', metal: 'gold', ceramic: 'white' },
  'wc-noir': { model: 'wc', metal: 'black', ceramic: 'white' },
  'bs-monolith': { model: 'basin', metal: 'gold', ceramic: 'travertine' },
  'bs-ellipse': { model: 'basin', metal: 'chrome', ceramic: 'white' },
  'bs-cove': { model: 'basin', metal: 'gold', ceramic: 'white' },
  'vn-atelier': { model: 'vanity', metal: 'gold', ceramic: 'travertine' },
  'vn-linea': { model: 'vanity', metal: 'black', ceramic: 'white' },
  'fc-arch': { model: 'basin', metal: 'gold' },
  'fc-linea': { model: 'basin', metal: 'black' },
  'fc-riva': { model: 'bathtub', metal: 'chrome' },
  'sh-halo': { model: 'shower', metal: 'gold' },
  'sh-column': { model: 'shower', metal: 'black' },
  'sh-screen': { model: 'shower', metal: 'black' },
  't-calacatta': { model: 'tiles', ceramic: 'white', stone: 'calacatta' },
  't-travertine': { model: 'tiles', ceramic: 'travertine', stone: 'travertine' },
  't-nero': { model: 'tiles', stone: 'nero' },
  't-verde': { model: 'tiles', stone: 'verde' },
  't-cemento': { model: 'tiles', stone: 'cemento' },
};
