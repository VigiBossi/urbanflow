/* =====================================================================
   Lastra Projekt · Admin panel
   Firebase Auth (email + password) → Firestore (site/settings, projects/*)
   → Storage (public/**, images compressed to WebP in the browser).
   Nothing secret lives here: the web config is public by design and every
   write is enforced server-side by firestore.rules / storage.rules.
   ===================================================================== */
import {
  initializeApp, getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, setPersistence, browserLocalPersistence,
  getFirestore, doc, getDoc, setDoc, deleteDoc, collection, getDocs, writeBatch, serverTimestamp,
  getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject
} from "./vendor/firebase.js";

const FB = window.LP_FIREBASE || {};
const LOCAL = JSON.parse(JSON.stringify(window.SITE || {}));     // js/config.js defaults (seed + backup base)
const LANGS = ["sq", "mk", "en"];
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = v => String(v == null ? "" : v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clone = o => JSON.parse(JSON.stringify(o == null ? null : o));
const app = $("#app");

/* ------------------------------------------------------------------ admin UI strings */
const T = {
  sq: {
    setup_t: "Lidhni Firebase", setup_d: "Paneli ka nevojë për projektin tuaj Firebase. Ndiqni SETUP-FIREBASE.md:", setup_1: "Krijoni projektin Firebase dhe një aplikacion Web.", setup_2: "Ngjitni konfigurimin në js/firebase-config.js.", setup_3: "Aktivizoni Email/Password te Authentication dhe krijoni përdoruesin admin.", setup_4: "Vendosni email-in tuaj në firestore.rules dhe storage.rules dhe publikojini.", setup_5: "Ringarkoni këtë faqe.",
    login_t: "Hyrje në panel", login_d: "Menaxhoni projektet, fotot, arkitektin dhe kontaktet.", email: "Email", password: "Fjalëkalimi", signin: "Hyr", forgot: "Keni harruar fjalëkalimin?", reset_sent: "U dërgua email për rivendosjen e fjalëkalimit.", login_err: "Email ose fjalëkalim i pasaktë.",
    tab_projects: "Projektet", tab_architect: "Arkitekti", tab_contact: "Kontakt & kompania", tab_models: "Modelet 3D & kopja",
    view_site: "Shiko faqen", signout: "Dil", loading: "Duke ngarkuar…", saved: "U ruajt. Faqja publike përditësohet menjëherë.", save: "Ruaj ndryshimet", saving: "Duke ruajtur…", cancel: "Anulo", close: "Mbyll", del: "Fshij", unsaved: "Ndryshime të paruajtura", discard_q: "Të hidhen ndryshimet e paruajtura?", discard: "Hidhi", keep: "Vazhdo redaktimin", err_save: "Ruajtja dështoi", err_perm: "Nuk keni leje. Kontrolloni email-in e admin-it në rregullat e Firebase.",
    seed_d: "Baza e të dhënave është bosh. Importoni përmbajtjen aktuale të faqes (projektet, arkitektin, kontaktet) për të filluar.", seed_btn: "Importo të dhënat e faqes", seeded: "Të dhënat e faqes u importuan.",
    p_title: "Projektet", p_d: "Shtoni, renditni, publikoni ose fshihni projektet. Tërhiqni për t'i renditur.", p_add: "Projekt i ri", p_empty: "Ende nuk ka projekte.", p_edit: "Redakto", p_up: "Lart", p_down: "Poshtë", p_pub: "Publikuar", p_hidden: "I fshehur", p_del_q: "Të fshihet ky projekt dhe fotot e tij? Ky veprim nuk kthehet.", p_deleted: "Projekti u fshi.", p_order: "Renditja u ruajt.",
    f_title: "Titulli", f_location: "Vendndodhja", f_desc: "Përshkrimi", f_status: "Statusi", st_finished: "I përfunduar", st_progress: "Në ndërtim", f_size: "Sipërfaqja (m²)", f_year: "Viti", f_published: "Publikuar në faqe", f_compare: "Krahasimi Para/Pas (vetëm nëse fotot janë e njëjta shtëpi)",
    f_cover: "Foto kryesore", f_gallery: "Galeria", f_phases: "Fazat", ph_before: "Para", ph_during: "Gjatë", ph_after: "Pas",
    drop: "Tërhiqni fotot këtu ose prekni për të zgjedhur", drop_one: "Tërhiqni një foto ose prekni", drop_hint: "Kompresohen automatikisht në WebP para ngarkimit", replace: "Zëvendëso", remove: "Hiq", left: "Majtas", right: "Djathtas", uploading: "Duke ngarkuar", upload_err: "Ngarkimi dështoi", busy: "Prisni të përfundojnë ngarkimet.", req_title: "Shkruani titullin shqip dhe zgjidhni foton kryesore.",
    a_title: "Studio e arkitektit", a_d: "Profili që shfaqet në faqen kryesore dhe te architect.html.", a_name: "Emri", a_years: "Vite përvojë", a_photo: "Portreti", a_role: "Roli", a_quote: "Citati", a_bio: "Biografia", a_spec: "Specializimi", a_spec_t: "Titulli", a_spec_d: "Përshkrimi",
    c_title: "Kontakt & kompania", c_d: "Kanalet bosh ose me vlera shembull fshihen automatikisht në faqe.", c_phone: "Telefoni (si shfaqet)", c_phoneLink: "Telefoni për thirrje (+389…)", c_whatsapp: "WhatsApp (vetëm shifra, p.sh. 38970123456)", c_email: "Email", c_address: "Adresa (Gostivar)", c_hours: "Orari i punës", c_fb: "Facebook URL", c_ig: "Instagram URL", c_est: "Kalkulatori çelës në dorë", c_est_d: "Muaj = bazë + m² × për m² (+ kat shtesë). Rezultati shfaqet si ± diapazon.", e_min: "Min m²", e_max: "Max m²", e_step: "Hapi", e_start: "Fillimi", e_range: "± muaj", e_base: "Bazë (muaj)", e_per: "Muaj për m²", e_floor: "Për kat shtesë", tier_structure: "Vetëm konstruksioni", tier_standard: "Çelës në dorë standard", tier_premium: "Çelës në dorë premium",
    m_title: "Modelet 3D & kopja rezervë", m_d: "Ngarkoni skedarë .glb ose ngjitni një URL. Nëse fusha është bosh, faqja përdor modelin 3D të integruar.", m_house: "Shtëpia 3D (faqja kryesore)", m_scale: "Maketa e arkitektit", m_url: "URL e modelit .glb", m_upload: "Ngarko .glb", m_backup: "Kopja rezervë", m_backup_d: "Shkarkoni të gjitha të dhënat aktuale si js/config.js – gati për t'u vendosur në projekt.", m_download: "Shkarko kopjen config.js", m_dl_ok: "config.js u shkarkua.", m_glb_err: "Zgjidhni një skedar .glb (max 15 MB)."
  },
  mk: {
    setup_t: "Поврзете Firebase", setup_d: "На панелот му треба вашиот Firebase проект. Следете го SETUP-FIREBASE.md:", setup_1: "Креирајте Firebase проект и Web апликација.", setup_2: "Залепете ја конфигурацијата во js/firebase-config.js.", setup_3: "Вклучете Email/Password во Authentication и креирајте го админ корисникот.", setup_4: "Внесете ја вашата е-пошта во firestore.rules и storage.rules и објавете ги.", setup_5: "Повторно вчитајте ја страницата.",
    login_t: "Најава во панелот", login_d: "Управувајте со проекти, фотографии, архитектот и контактите.", email: "Е-пошта", password: "Лозинка", signin: "Најави се", forgot: "Ја заборавивте лозинката?", reset_sent: "Испратена е е-пошта за ресетирање на лозинката.", login_err: "Погрешна е-пошта или лозинка.",
    tab_projects: "Проекти", tab_architect: "Архитект", tab_contact: "Контакт и компанија", tab_models: "3D модели и резерва",
    view_site: "Види ја страницата", signout: "Одјави се", loading: "Се вчитува…", saved: "Зачувано. Јавната страница се ажурира веднаш.", save: "Зачувај промени", saving: "Се зачувува…", cancel: "Откажи", close: "Затвори", del: "Избриши", unsaved: "Незачувани промени", discard_q: "Да се отфрлат незачуваните промени?", discard: "Отфрли", keep: "Продолжи со уредување", err_save: "Зачувувањето не успеа", err_perm: "Немате дозвола. Проверете ја админ е-поштата во правилата на Firebase.",
    seed_d: "Базата е празна. Увезете ја тековната содржина на страницата (проекти, архитект, контакти) за да започнете.", seed_btn: "Увези податоци од страницата", seeded: "Податоците од страницата се увезени.",
    p_title: "Проекти", p_d: "Додавајте, подредувајте, објавувајте или кријте проекти. Повлечете за подредување.", p_add: "Нов проект", p_empty: "Сè уште нема проекти.", p_edit: "Уреди", p_up: "Горе", p_down: "Долу", p_pub: "Објавено", p_hidden: "Скриено", p_del_q: "Да се избрише проектот и неговите фотографии? Ова не може да се врати.", p_deleted: "Проектот е избришан.", p_order: "Редоследот е зачуван.",
    f_title: "Наслов", f_location: "Локација", f_desc: "Опис", f_status: "Статус", st_finished: "Завршен", st_progress: "Во изградба", f_size: "Површина (m²)", f_year: "Година", f_published: "Објавено на страницата", f_compare: "Споредба Пред/По (само ако фотографиите се од истата куќа)",
    f_cover: "Главна фотографија", f_gallery: "Галерија", f_phases: "Фази", ph_before: "Пред", ph_during: "За време", ph_after: "По",
    drop: "Повлечете фотографии тука или допрете за избор", drop_one: "Повлечете фотографија или допрете", drop_hint: "Автоматски се компресираат во WebP пред прикачување", replace: "Замени", remove: "Отстрани", left: "Лево", right: "Десно", uploading: "Се прикачува", upload_err: "Прикачувањето не успеа", busy: "Почекајте да завршат прикачувањата.", req_title: "Внесете наслов на албански и изберете главна фотографија.",
    a_title: "Студио на архитектот", a_d: "Профилот што се прикажува на почетната страница и на architect.html.", a_name: "Име", a_years: "Години искуство", a_photo: "Портрет", a_role: "Улога", a_quote: "Цитат", a_bio: "Биографија", a_spec: "Специјализација", a_spec_t: "Наслов", a_spec_d: "Опис",
    c_title: "Контакт и компанија", c_d: "Празните канали или примерните вредности автоматски се кријат на страницата.", c_phone: "Телефон (како се прикажува)", c_phoneLink: "Телефон за повик (+389…)", c_whatsapp: "WhatsApp (само бројки, пр. 38970123456)", c_email: "Е-пошта", c_address: "Адреса (Гостивар)", c_hours: "Работно време", c_fb: "Facebook URL", c_ig: "Instagram URL", c_est: "Калкулатор „клуч на рака“", c_est_d: "Месеци = основа + m² × по m² (+ дополнителен кат). Резултатот се прикажува како ± опсег.", e_min: "Мин m²", e_max: "Макс m²", e_step: "Чекор", e_start: "Почеток", e_range: "± месеци", e_base: "Основа (месеци)", e_per: "Месеци по m²", e_floor: "По дополнителен кат", tier_structure: "Само конструкција", tier_standard: "Стандарден клуч на рака", tier_premium: "Премиум клуч на рака",
    m_title: "3D модели и резервна копија", m_d: "Прикачете .glb датотеки или залепете URL. Ако полето е празно, страницата го користи вградениот 3D модел.", m_house: "3D куќа (почетна)", m_scale: "Макета на архитектот", m_url: "URL на .glb модел", m_upload: "Прикачи .glb", m_backup: "Резервна копија", m_backup_d: "Преземете ги сите тековни податоци како js/config.js – подготвено за ставање во проектот.", m_download: "Преземи config.js копија", m_dl_ok: "config.js е преземен.", m_glb_err: "Изберете .glb датотека (макс. 15 MB)."
  },
  en: {
    setup_t: "Connect Firebase", setup_d: "The panel needs your Firebase project. Follow SETUP-FIREBASE.md:", setup_1: "Create a Firebase project and a Web app.", setup_2: "Paste its config into js/firebase-config.js.", setup_3: "Enable Email/Password under Authentication and create the admin user.", setup_4: "Put your email into firestore.rules and storage.rules and publish them.", setup_5: "Reload this page.",
    login_t: "Sign in to the panel", login_d: "Manage projects, photos, the architect and contact details.", email: "Email", password: "Password", signin: "Sign in", forgot: "Forgot your password?", reset_sent: "Password reset email sent.", login_err: "Wrong email or password.",
    tab_projects: "Projects", tab_architect: "Architect", tab_contact: "Contact & company", tab_models: "3D models & backup",
    view_site: "View live site", signout: "Sign out", loading: "Loading…", saved: "Saved. The public site updates right away.", save: "Save changes", saving: "Saving…", cancel: "Cancel", close: "Close", del: "Delete", unsaved: "Unsaved changes", discard_q: "Discard unsaved changes?", discard: "Discard", keep: "Keep editing", err_save: "Saving failed", err_perm: "Permission denied. Check the admin email in the Firebase rules.",
    seed_d: "The database is empty. Import the current website content (projects, architect, contact details) to get started.", seed_btn: "Import website data", seeded: "Website data imported.",
    p_title: "Projects", p_d: "Add, reorder, publish or hide projects. Drag to reorder.", p_add: "New project", p_empty: "No projects yet.", p_edit: "Edit", p_up: "Up", p_down: "Down", p_pub: "Published", p_hidden: "Hidden", p_del_q: "Delete this project and its photos? This cannot be undone.", p_deleted: "Project deleted.", p_order: "Order saved.",
    f_title: "Title", f_location: "Location", f_desc: "Description", f_status: "Status", st_finished: "Finished", st_progress: "In progress", f_size: "Size (m²)", f_year: "Year", f_published: "Published on the site", f_compare: "Before/After comparison (only when both photos show the same house)",
    f_cover: "Cover photo", f_gallery: "Gallery", f_phases: "Phases", ph_before: "Before", ph_during: "During", ph_after: "After",
    drop: "Drop photos here or tap to choose", drop_one: "Drop a photo or tap", drop_hint: "Automatically compressed to WebP before upload", replace: "Replace", remove: "Remove", left: "Left", right: "Right", uploading: "Uploading", upload_err: "Upload failed", busy: "Please wait for the uploads to finish.", req_title: "Add the Albanian title and choose a cover photo.",
    a_title: "Architect studio", a_d: "The profile shown on the home page and on architect.html.", a_name: "Name", a_years: "Years of experience", a_photo: "Portrait", a_role: "Role", a_quote: "Quote", a_bio: "Bio", a_spec: "Specialty", a_spec_t: "Title", a_spec_d: "Description",
    c_title: "Contact & company", c_d: "Empty channels or example values are hidden on the site automatically.", c_phone: "Phone (as displayed)", c_phoneLink: "Phone to dial (+389…)", c_whatsapp: "WhatsApp (digits only, e.g. 38970123456)", c_email: "Email", c_address: "Address (Gostivar)", c_hours: "Working hours", c_fb: "Facebook URL", c_ig: "Instagram URL", c_est: "Turnkey estimator", c_est_d: "Months = base + m² × per m² (+ extra floor). The result is shown as a ± range.", e_min: "Min m²", e_max: "Max m²", e_step: "Step", e_start: "Start", e_range: "± months", e_base: "Base (months)", e_per: "Months per m²", e_floor: "Per extra floor", tier_structure: "Structure only", tier_standard: "Standard turnkey", tier_premium: "Premium turnkey",
    m_title: "3D models & backup", m_d: "Upload .glb files or paste a URL. When a field is empty the site uses its built-in 3D model.", m_house: "3D house (home page)", m_scale: "Architect scale model", m_url: ".glb model URL", m_upload: "Upload .glb", m_backup: "Backup", m_backup_d: "Download all current data as js/config.js – ready to drop into the project.", m_download: "Download config.js backup", m_dl_ok: "config.js downloaded.", m_glb_err: "Choose a .glb file (max 15 MB)."
  }
};
let ui = (() => { try { const l = localStorage.getItem("lp_admin_lang"); return LANGS.includes(l) ? l : "sq"; } catch (e) { return "sq"; } })();
const t = k => (T[ui] && T[ui][k]) || T.en[k] || k;

/* ------------------------------------------------------------------ toasts + modals */
function toast(msg, type = "ok", ms = 3200) {
  const el = document.createElement("div"); el.className = "toast " + type; el.textContent = msg;
  $(".toasts").appendChild(el); requestAnimationFrame(() => el.classList.add("on"));
  setTimeout(() => { el.classList.remove("on"); setTimeout(() => el.remove(), 300); }, ms);
}
function confirmBox(msg, { ok = t("del"), cancel = t("cancel"), danger = true } = {}) {
  return new Promise(res => {
    const root = $(".modal-root"), prev = document.activeElement;
    root.innerHTML = `<div class="overlay" role="alertdialog" aria-modal="true" aria-labelledby="dlg-t"><div class="dialog"><h3 id="dlg-t">${esc(msg)}</h3><div class="acts"><button type="button" class="btn btn-ghost" data-r="0">${esc(cancel)}</button><button type="button" class="btn ${danger ? "btn-danger" : "btn-primary"}" data-r="1">${esc(ok)}</button></div></div></div>`;
    const ov = $(".overlay", root); requestAnimationFrame(() => ov.classList.add("on"));
    const done = v => { ov.classList.remove("on"); setTimeout(() => { root.innerHTML = ""; prev && prev.focus && prev.focus(); }, 200); document.removeEventListener("keydown", key); res(v); };
    const key = e => { if (e.key === "Escape") done(false); };
    document.addEventListener("keydown", key);
    ov.addEventListener("click", e => { const b = e.target.closest("[data-r]"); if (b) done(b.dataset.r === "1"); else if (e.target === ov) done(false); });
    $('[data-r="0"]', root).focus();
  });
}

/* ------------------------------------------------------------------ not configured → setup screen */
const READY = !!(FB.projectId && FB.apiKey);
if (!READY) {
  app.innerHTML = `<div class="gate"><div class="card"><span class="mark">L</span><h1>${t("setup_t")}</h1><p class="lead">${t("setup_d")}</p>
    <ol><li>${t("setup_1")}</li><li>${t("setup_2")} <code>js/firebase-config.js</code></li><li>${t("setup_3")}</li><li>${t("setup_4")}</li><li>${t("setup_5")}</li></ol>
    <p class="muted">SETUP-FIREBASE.md</p></div></div>`;
}

const fbApp = READY ? initializeApp(FB) : null;
const auth = READY ? getAuth(fbApp) : null, db = READY ? getFirestore(fbApp) : null, storage = READY ? getStorage(fbApp) : null;
if (READY) setPersistence(auth, browserLocalPersistence).catch(() => {});

/* ------------------------------------------------------------------ state */
const S = { user: null, tab: "projects", settings: null, projects: [], dirty: {}, editing: null, uploads: 0 };
const anyDirty = () => Object.values(S.dirty).some(Boolean) || (S.editing && S.editing.dirty);
addEventListener("beforeunload", e => { if (anyDirty() || S.uploads) { e.preventDefault(); e.returnValue = ""; } });
const permErr = e => (e && /permission|insufficient/i.test(e.code + " " + e.message)) ? t("err_perm") : `${t("err_save")}: ${e && (e.code || e.message)}`;

/* ------------------------------------------------------------------ image pipeline: decode → resize → WebP (JPEG fallback) → upload */
async function decode(file) {
  if ("createImageBitmap" in window) { try { return await createImageBitmap(file, { imageOrientation: "from-image" }); } catch (e) {} }
  const url = URL.createObjectURL(file); const img = new Image(); img.decoding = "async"; img.src = url;
  try { await img.decode(); } finally { setTimeout(() => URL.revokeObjectURL(url), 1000); }
  return img;
}
async function encode(src, maxSide, q = .82) {
  const sw = src.width || src.naturalWidth, sh = src.height || src.naturalHeight, k = Math.min(1, maxSide / Math.max(sw, sh));
  const w = Math.max(1, Math.round(sw * k)), h = Math.max(1, Math.round(sh * k));
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d"); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high"; g.drawImage(src, 0, 0, w, h);
  let blob = await new Promise(r => c.toBlob(r, "image/webp", q));
  if (!blob || blob.type !== "image/webp") blob = await new Promise(r => c.toBlob(r, "image/jpeg", .86));   // older Safari can't encode WebP
  return { blob, w, h, ext: blob.type === "image/webp" ? "webp" : "jpg" };
}
function put(path, blob, onProgress) {
  return new Promise((res, rej) => {
    const task = uploadBytesResumable(ref(storage, path), blob, { contentType: blob.type, cacheControl: "public, max-age=31536000, immutable" });
    task.on("state_changed", s => onProgress && onProgress(s.totalBytes ? s.bytesTransferred / s.totalBytes : 0), rej, async () => { try { res(await getDownloadURL(task.snapshot.ref)); } catch (e) { rej(e); } });
  });
}
const slug = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "item";
/* returns { url, url800, path, path800, w, h } */
async function uploadImage(file, folder, progressEl, sizes = [1600, 800]) {
  S.uploads++;
  const row = document.createElement("div"); row.className = "prog-row"; row.innerHTML = `<span>${t("uploading")} · ${esc(file.name)}</span><b class="mono">0%</b><span class="bar"><i></i></span>`;
  progressEl && progressEl.appendChild(row);
  const set = p => { $(".bar i", row).style.transform = `scaleX(${p})`; $("b", row).textContent = Math.round(p * 100) + "%"; };
  try {
    const src = await decode(file);
    const big = await encode(src, sizes[0]), small = await encode(src, sizes[1], .8);
    if (src.close) src.close();
    const stamp = Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name = slug(file.name.replace(/\.[^.]+$/, ""));
    const path = `${folder}/${stamp}-${name}-${sizes[0]}.${big.ext}`, path800 = `${folder}/${stamp}-${name}-${sizes[1]}.${small.ext}`;
    const total = big.blob.size + small.blob.size; let a = 0, b = 0;
    const [url, url800] = await Promise.all([put(path, big.blob, p => { a = p * big.blob.size; set((a + b) / total); }), put(path800, small.blob, p => { b = p * small.blob.size; set((a + b) / total); })]);
    set(1); setTimeout(() => row.remove(), 900);
    return { url, url800, path, path800, w: big.w, h: big.h };
  } catch (e) {
    row.remove(); toast(`${t("upload_err")}: ${file.name}`, "err"); console.error(e); return null;
  } finally { S.uploads--; }
}
async function removeFiles(img) {
  if (!img || typeof img !== "object") return;
  for (const p of [img.path, img.path800]) if (p) { try { await deleteObject(ref(storage, p)); } catch (e) {} }
}
/* preview src for both local paths (js/config.js) and uploads */
const thumb = img => !img ? "" : typeof img === "object" ? (img.url800 || img.url) : /^(https?:)?\/\//.test(img) ? img : "../" + String(img).replace(/\.jpe?g$/i, "-800.webp");

/* ------------------------------------------------------------------ data */
async function loadAll() {
  const [sSnap, pSnap] = await Promise.all([getDoc(doc(db, "site", "settings")), getDocs(collection(db, "projects"))]);
  S.settings = sSnap.exists() ? sSnap.data() : null;
  S.projects = pSnap.docs.map(d => ({ ...d.data(), id: d.data().id || d.id, _doc: d.id })).sort((a, b) => (a.order || 0) - (b.order || 0));
}
const settingsBase = () => {
  const s = S.settings || {};
  const pick = k => (s[k] !== undefined && s[k] !== null ? clone(s[k]) : clone(LOCAL[k]));
  return {
    phone: pick("phone") || "", phoneLink: pick("phoneLink") || "", whatsapp: pick("whatsapp") || "", email: pick("email") || "", address: pick("address") || "",
    officeHours: pick("officeHours") || { sq: "", mk: "", en: "" }, facebook: pick("facebook") || "", instagram: pick("instagram") || "",
    estimator: pick("estimator") || {}, architect: pick("architect") || {}, models: pick("models") || { house: null, scale: null }
  };
};
async function saveSettings(patch) {
  const next = { ...settingsBase(), ...patch, updatedAt: serverTimestamp() };
  if (next.estimator && next.estimator.tiers) for (const k of Object.keys(next.estimator.tiers)) delete next.estimator.tiers[k].items;   // deliverable lists stay in config.js / i18n
  await setDoc(doc(db, "site", "settings"), next);
  S.settings = { ...next, updatedAt: null };
}
async function seed() {
  const s = { ...settingsBase(), updatedAt: serverTimestamp() };
  if (s.estimator && s.estimator.tiers) for (const k of Object.keys(s.estimator.tiers)) delete s.estimator.tiers[k].items;
  const batch = writeBatch(db);
  batch.set(doc(db, "site", "settings"), s);
  (LOCAL.projects || []).forEach((p, i) => batch.set(doc(db, "projects", p.id), { ...clone(p), order: i, published: true, compare: !!p.compare, updatedAt: serverTimestamp() }));
  await batch.commit();
  await loadAll();
}

/* ------------------------------------------------------------------ shell */
function renderLogin(msg) {
  app.innerHTML = `<div class="gate"><form class="card" id="login" novalidate>
    <span class="mark">L</span><h1>${t("login_t")}</h1><p class="lead">${t("login_d")}</p>
    <label class="field"><span>${t("email")}</span><input class="input" type="email" name="email" autocomplete="username" required inputmode="email" autocapitalize="off" spellcheck="false"></label>
    <label class="field"><span>${t("password")}</span><input class="input" type="password" name="password" autocomplete="current-password" required></label>
    <p class="hint" role="alert">${msg ? esc(msg) : ""}</p>
    <button class="btn btn-primary btn-block" type="submit">${t("signin")}</button>
    <p style="margin:14px 0 0;text-align:center"><button type="button" class="link-btn" id="forgot">${t("forgot")}</button></p>
    <div style="display:flex;justify-content:center;margin-top:10px">${langSwitch(true)}</div>
  </form></div>`;
  const f = $("#login");
  f.addEventListener("submit", async e => {
    e.preventDefault(); const b = $("button[type=submit]", f); b.disabled = true; b.innerHTML = `<span class="spinner"></span>`;
    try { await signInWithEmailAndPassword(auth, f.email.value.trim(), f.password.value); }
    catch (err) { renderLogin(t("login_err")); }
  });
  $("#forgot").addEventListener("click", async () => {
    const em = f.email.value.trim(); if (!em) { f.email.focus(); return; }
    try { await sendPasswordResetEmail(auth, em); } catch (e) {}
    toast(t("reset_sent"), "info");                                   // same message either way (no account probing)
  });
  bindLang(); f.email.focus();
}
const langSwitch = light => `<div class="langs"${light ? ' style="border-color:var(--line)"' : ""} role="group" aria-label="Language">${LANGS.map(l => `<button type="button" data-ui-lang="${l}" aria-pressed="${l === ui}"${light ? ' style="color:var(--ink)"' : ""}>${l.toUpperCase()}</button>`).join("")}</div>`;
function bindLang() {
  $$("[data-ui-lang]").forEach(b => b.addEventListener("click", () => {
    ui = b.dataset.uiLang; try { localStorage.setItem("lp_admin_lang", ui); } catch (e) {}
    document.documentElement.lang = ui;
    if (S.user) renderDash(); else renderLogin();
  }));
}
function renderDash() {
  const tabs = [["projects", "tab_projects"], ["architect", "tab_architect"], ["contact", "tab_contact"], ["models", "tab_models"]];
  app.innerHTML = `
    <header class="topbar"><span class="mark">L</span><div class="brand"><b>Lastra Projekt</b><span>${esc(S.user.email)}</span></div>
      ${langSwitch()}
      <div class="top-actions"><a class="btn btn-sm btn-ghost" href="../index.html" target="_blank" rel="noopener"><span aria-hidden="true">↗</span><span class="label">${t("view_site")}</span></a><button type="button" class="btn btn-sm btn-ghost" id="signout"><span aria-hidden="true">⎋</span><span class="label">${t("signout")}</span></button></div>
    </header>
    <nav class="tabs" role="tablist">${tabs.map(([k, l], i) => `<button type="button" role="tab" data-tab="${k}" aria-selected="${S.tab === k}"><span class="mono">0${i + 1}</span>${t(l)}${S.dirty[k] ? '<span class="dot" aria-label="' + esc(t("unsaved")) + '"></span>' : ""}</button>`).join("")}</nav>
    <main class="panel" id="panel"></main>
    <div class="savebar" id="savebar"><p>${t("unsaved")}</p><button type="button" class="btn btn-ghost btn-sm" id="sb-cancel">${t("cancel")}</button><button type="button" class="btn btn-bronze btn-sm" id="sb-save">${t("save")}</button></div>`;
  bindLang();
  $("#signout").addEventListener("click", async () => { if (anyDirty() && !(await confirmBox(t("discard_q"), { ok: t("discard"), cancel: t("keep") }))) return; S.dirty = {}; await signOut(auth); });
  $$("[data-tab]").forEach(b => b.addEventListener("click", async () => {
    if (b.dataset.tab === S.tab) return;
    if (S.dirty[S.tab] && !(await confirmBox(t("discard_q"), { ok: t("discard"), cancel: t("keep") }))) return;
    S.dirty[S.tab] = false; S.tab = b.dataset.tab; renderDash();
  }));
  ({ projects: tabProjects, architect: tabArchitect, contact: tabContact, models: tabModels })[S.tab]();
}
function markDirty(on = true) {
  S.dirty[S.tab] = on; $("#savebar") && $("#savebar").classList.toggle("on", on);
  const tb = $(`[data-tab="${S.tab}"]`); if (tb) { const d = $(".dot", tb); if (on && !d) tb.insertAdjacentHTML("beforeend", '<span class="dot"></span>'); if (!on && d) d.remove(); }
}
function saveBar(onSave, onCancel) {
  $("#sb-save").onclick = async () => {
    const b = $("#sb-save"); b.disabled = true; b.textContent = t("saving");
    try { if (S.uploads) { toast(t("busy"), "info"); return; } await onSave(); markDirty(false); toast(t("saved")); }
    catch (e) { console.error(e); toast(permErr(e), "err", 5000); }
    finally { b.disabled = false; b.textContent = t("save"); }
  };
  $("#sb-cancel").onclick = async () => { if (await confirmBox(t("discard_q"), { ok: t("discard"), cancel: t("keep") })) { markDirty(false); onCancel(); } };
}
/* helpers for nested form values: name="architect.role.sq" */
const getPath = (o, p) => p.split(".").reduce((a, k) => (a == null ? a : a[k]), o);
const setPath = (o, p, v) => { const ks = p.split("."); let a = o; ks.slice(0, -1).forEach(k => { if (a[k] == null || typeof a[k] !== "object") a[k] = /^\d+$/.test(k) ? [] : {}; a = a[k]; }); a[ks[ks.length - 1]] = v; };
const langTabs = (id, filled = {}) => `<div class="ltabs" role="tablist" data-ltabs="${id}">${LANGS.map((l, i) => `<button type="button" role="tab" data-l="${l}" aria-selected="${i === 0}">${l.toUpperCase()}<span class="fill${filled[l] ? " ok" : ""}"></span></button>`).join("")}</div>`;
function bindLangTabs(root) {
  $$("[data-ltabs]", root).forEach(tb => tb.addEventListener("click", e => {
    const b = e.target.closest("[data-l]"); if (!b) return;
    $$("[data-l]", tb).forEach(x => x.setAttribute("aria-selected", x === b));
    $$(`[data-lpane="${tb.dataset.ltabs}"]`, root).forEach(p => { p.hidden = p.dataset.lang !== b.dataset.l; });
  }));
}

/* ------------------------------------------------------------------ dropzone */
function dropzone({ multiple, accept = "image/*", label }) {
  return `<label class="drop"><input type="file" accept="${accept}"${multiple ? " multiple" : ""}><b>${esc(label || (multiple ? t("drop") : t("drop_one")))}</b><small>${t("drop_hint")}</small></label>`;
}
function bindDrop(el, onFiles) {
  const inp = $("input", el);
  inp.addEventListener("change", () => { const fs = [...inp.files]; inp.value = ""; if (fs.length) onFiles(fs); });
  el.addEventListener("dragover", e => { e.preventDefault(); el.classList.add("over"); });
  el.addEventListener("dragleave", () => el.classList.remove("over"));
  el.addEventListener("drop", e => { e.preventDefault(); el.classList.remove("over"); const fs = [...e.dataTransfer.files].filter(f => inp.accept === "image/*" ? f.type.startsWith("image/") : true); if (fs.length) onFiles(inp.multiple ? fs : fs.slice(0, 1)); });
}

/* ================================================================== 1 · PROJECTS */
function tabProjects() {
  const p = $("#panel");
  const seedBox = !S.settings && !S.projects.length ? `<div class="notice"><p>${t("seed_d")}</p><button type="button" class="btn btn-bronze btn-sm" id="seed">${t("seed_btn")}</button></div>` : "";
  p.innerHTML = `${seedBox}<div class="sec-h"><div><h2>${t("p_title")}</h2><p>${t("p_d")}</p></div><button type="button" class="btn btn-primary" id="p-add">+ ${t("p_add")}</button></div>
    <div class="plist" id="plist">${S.projects.length ? S.projects.map((x, i) => rowHTML(x, i)).join("") : `<p class="empty">${t("p_empty")}</p>`}</div>`;
  const sd = $("#seed"); if (sd) sd.addEventListener("click", async () => { sd.disabled = true; try { await seed(); toast(t("seeded")); renderDash(); } catch (e) { toast(permErr(e), "err", 5000); sd.disabled = false; } });
  $("#p-add").addEventListener("click", () => openEditor(null));
  const list = $("#plist");
  list.addEventListener("click", async e => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    const i = +b.closest(".prow").dataset.i, pr = S.projects[i];
    if (b.dataset.act === "edit") openEditor(pr);
    if (b.dataset.act === "up" && i > 0) { [S.projects[i - 1], S.projects[i]] = [S.projects[i], S.projects[i - 1]]; await saveOrder(); }
    if (b.dataset.act === "down" && i < S.projects.length - 1) { [S.projects[i + 1], S.projects[i]] = [S.projects[i], S.projects[i + 1]]; await saveOrder(); }
    if (b.dataset.act === "del") {
      if (!(await confirmBox(t("p_del_q")))) return;
      try {
        await deleteDoc(doc(db, "projects", pr._doc || pr.id));
        for (const img of [pr.cover, ...(pr.gallery || []), ...Object.values(pr.phases || {})]) await removeFiles(img);
        S.projects.splice(i, 1); toast(t("p_deleted")); tabProjects();
      } catch (err) { toast(permErr(err), "err", 5000); }
    }
  });
  list.addEventListener("change", async e => {
    const c = e.target.closest("[data-pub]"); if (!c) return;
    const i = +c.closest(".prow").dataset.i, pr = S.projects[i];
    try { await setDoc(doc(db, "projects", pr._doc || pr.id), { published: c.checked, updatedAt: serverTimestamp() }, { merge: true }); pr.published = c.checked; toast(t("saved")); tabProjects(); }
    catch (err) { c.checked = !c.checked; toast(permErr(err), "err", 5000); }
  });
  /* drag to reorder (mouse / pen); touch uses the up / down buttons */
  let from = -1;
  $$(".prow", list).forEach(row => {
    row.addEventListener("dragstart", e => { from = +row.dataset.i; row.classList.add("dragging"); e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", String(from)); } catch (err) {} });
    row.addEventListener("dragend", () => row.classList.remove("dragging"));
    row.addEventListener("dragover", e => { e.preventDefault(); row.classList.add("over"); });
    row.addEventListener("dragleave", () => row.classList.remove("over"));
    row.addEventListener("drop", async e => { e.preventDefault(); row.classList.remove("over"); const to = +row.dataset.i; if (from < 0 || from === to) return; const [m] = S.projects.splice(from, 1); S.projects.splice(to, 0, m); await saveOrder(); });
  });
}
const rowHTML = (x, i) => `<article class="prow${x.published === false ? " hidden-p" : ""}" data-i="${i}" draggable="true">
  <span class="handle" aria-hidden="true">⋮⋮</span>
  <img class="pthumb" src="${esc(thumb(x.cover))}" alt="" loading="lazy">
  <div class="pinfo"><b>${esc((x.title && (x.title[ui] || x.title.sq)) || "—")}</b><span><span class="badge ${esc(x.status)}">${t("st_" + x.status)}</span>${x.published === false ? `<span class="badge off">${t("p_hidden")}</span>` : ""}${esc((x.location && (x.location[ui] || x.location.sq)) || "")} · ${esc(x.size || "")} m² · ${esc(x.year || "")}</span></div>
  <div class="pact">
    <label class="toggle" title="${esc(t("p_pub"))}"><input type="checkbox" data-pub${x.published !== false ? " checked" : ""}><i></i><span class="sr-only">${t("p_pub")}</span></label>
    <button type="button" class="icon-btn" data-act="up" aria-label="${esc(t("p_up"))}">↑</button><button type="button" class="icon-btn" data-act="down" aria-label="${esc(t("p_down"))}">↓</button>
    <button type="button" class="btn btn-sm btn-ghost" data-act="edit">${t("p_edit")}</button><button type="button" class="icon-btn" data-act="del" aria-label="${esc(t("del"))}" style="color:var(--err)">✕</button>
  </div></article>`;
async function saveOrder() {
  try {
    const b = writeBatch(db);
    S.projects.forEach((x, i) => { x.order = i; b.set(doc(db, "projects", x._doc || x.id), { order: i }, { merge: true }); });
    await b.commit(); toast(t("p_order"));
  } catch (e) { toast(permErr(e), "err", 5000); }
  tabProjects();
}

/* ---- project editor (full-screen sheet) */
function openEditor(src) {
  const isNew = !src;
  const P = isNew ? { id: "", status: "finished", size: 180, year: new Date().getFullYear(), title: { sq: "", mk: "", en: "" }, location: { sq: "Gostivar", mk: "Гостивар", en: "Gostivar" }, desc: { sq: "", mk: "", en: "" }, cover: null, gallery: [], phases: {}, compare: false, published: true, order: S.projects.length } : clone(src);
  P.gallery = P.gallery || []; P.phases = P.phases || {}; P.title = P.title || {}; P.location = P.location || {}; P.desc = P.desc || {};
  const folder = `public/projects/${isNew ? "new-" + Date.now().toString(36) : slug(P._doc || P.id)}`;
  const ed = { dirty: false, added: [], removed: [] };            // uploads to roll back on cancel / files to delete after save
  S.editing = ed;
  const root = document.createElement("div"); root.className = "editor"; root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true");
  const filled = k => Object.fromEntries(LANGS.map(l => [l, !!(P[k] && P[k][l])]));
  root.innerHTML = `
    <div class="ed-h"><h2>${esc(isNew ? t("p_add") : (P.title[ui] || P.title.sq || t("p_edit")))}</h2><button type="button" class="icon-btn" data-close aria-label="${esc(t("close"))}">✕</button></div>
    <div class="ed-b"><form class="ed-in" novalidate>
      <div class="box">${langTabs("p", filled("title"))}
        ${LANGS.map((l, i) => `<div class="lpane" data-lpane="p" data-lang="${l}"${i ? " hidden" : ""}>
          <label class="field"><span>${t("f_title")} · ${l.toUpperCase()}${l === "sq" ? " *" : ""}</span><input class="input" name="title.${l}" value="${esc(P.title[l])}"></label>
          <label class="field"><span>${t("f_location")} · ${l.toUpperCase()}</span><input class="input" name="location.${l}" value="${esc(P.location[l])}"></label>
          <label class="field"><span>${t("f_desc")} · ${l.toUpperCase()}</span><textarea class="input" name="desc.${l}" rows="4">${esc(P.desc[l])}</textarea></label></div>`).join("")}
      </div>
      <div class="box"><div class="grid3">
        <label class="field"><span>${t("f_status")}</span><select class="input" name="status"><option value="finished"${P.status === "finished" ? " selected" : ""}>${t("st_finished")}</option><option value="progress"${P.status === "progress" ? " selected" : ""}>${t("st_progress")}</option></select></label>
        <label class="field"><span>${t("f_size")}</span><input class="input" name="size" type="number" inputmode="numeric" min="10" max="5000" value="${esc(P.size)}"></label>
        <label class="field"><span>${t("f_year")}</span><input class="input" name="year" type="number" inputmode="numeric" min="1990" max="2100" value="${esc(P.year)}"></label></div>
        <label class="toggle"><input type="checkbox" name="published"${P.published !== false ? " checked" : ""}><i></i><span>${t("f_published")}</span></label>
        <label class="toggle"><input type="checkbox" name="compare"${P.compare ? " checked" : ""}><i></i><span>${t("f_compare")}</span></label>
      </div>
      <div class="box"><h3>${t("f_cover")} *</h3><div class="single" data-slot="cover"></div></div>
      <div class="box"><h3>${t("f_gallery")}</h3><div data-slot="gallery"></div></div>
      <div class="box"><h3>${t("f_phases")}</h3><div class="phases">${["before", "during", "after"].map(k => `<div><p class="flabel">${t("ph_" + k)}</p><div class="single" data-slot="phase-${k}"></div></div>`).join("")}</div></div>
      <div class="prog" id="ed-prog"></div>
    </form></div>
    <div class="ed-f"><button type="button" class="btn btn-ghost" data-close>${t("cancel")}</button><button type="button" class="btn btn-bronze" data-save>${t("save")}</button></div>`;
  document.body.appendChild(root); document.documentElement.style.overflow = "hidden";
  requestAnimationFrame(() => root.classList.add("on"));
  const form = $("form", root), prog = $("#ed-prog", root);
  bindLangTabs(root);
  form.addEventListener("input", () => { ed.dirty = true; });
  const imgTile = (img, i, total, tag) => `<div class="img"><img src="${esc(thumb(img))}" alt="" loading="lazy">${tag ? `<span class="tag">${esc(tag)}</span>` : ""}<div class="tools">${total > 1 ? `<button type="button" data-mv="-1" data-i="${i}" aria-label="${esc(t("left"))}">←</button><button type="button" data-mv="1" data-i="${i}" aria-label="${esc(t("right"))}">→</button>` : "<span></span>"}<button type="button" data-rm="${i}" aria-label="${esc(t("remove"))}">✕</button></div></div>`;
  const drawSingle = (slotEl, get, setImg) => {
    const img = get();
    slotEl.innerHTML = (img ? `<div class="imgs" style="grid-template-columns:minmax(0,1fr)">${imgTile(img, 0, 1)}</div>` : "") + dropzone({ multiple: false, label: img ? t("replace") : t("drop_one") });
    bindDrop($(".drop", slotEl), async fs => { const up = await uploadImage(fs[0], folder, prog); if (!up) return; ed.added.push(up); const old = get(); if (old) ed.removed.push(old); setImg(up); ed.dirty = true; drawSingle(slotEl, get, setImg); });
    const rm = $("[data-rm]", slotEl); if (rm) rm.addEventListener("click", () => { ed.removed.push(get()); setImg(null); ed.dirty = true; drawSingle(slotEl, get, setImg); });
  };
  drawSingle($('[data-slot="cover"]', root), () => P.cover, v => { P.cover = v; });
  ["before", "during", "after"].forEach(k => drawSingle($(`[data-slot="phase-${k}"]`, root), () => P.phases[k], v => { if (v) P.phases[k] = v; else delete P.phases[k]; }));
  const gal = $('[data-slot="gallery"]', root);
  const drawGallery = () => {
    gal.innerHTML = `<div class="imgs">${P.gallery.map((g, i) => imgTile(g, i, P.gallery.length, String(i + 1).padStart(2, "0"))).join("")}</div>` + dropzone({ multiple: true });
    bindDrop($(".drop", gal), async fs => {
      for (const f of fs) { const up = await uploadImage(f, folder, prog); if (up) { ed.added.push(up); P.gallery.push(up); ed.dirty = true; drawGallery(); } }
    });
    gal.querySelector(".imgs").addEventListener("click", e => {
      const mv = e.target.closest("[data-mv]"), rm = e.target.closest("[data-rm]");
      if (mv) { const i = +mv.dataset.i, j = i + +mv.dataset.mv; if (j < 0 || j >= P.gallery.length) return; [P.gallery[i], P.gallery[j]] = [P.gallery[j], P.gallery[i]]; ed.dirty = true; drawGallery(); }
      if (rm) { const [g] = P.gallery.splice(+rm.dataset.rm, 1); ed.removed.push(g); ed.dirty = true; drawGallery(); }
    });
  };
  drawGallery();
  const close = async (force) => {
    if (!force && (ed.dirty || S.uploads)) { if (!(await confirmBox(t("discard_q"), { ok: t("discard"), cancel: t("keep") }))) return; for (const up of ed.added) await removeFiles(up); }
    root.classList.remove("on"); document.documentElement.style.overflow = ""; S.editing = null;
    document.removeEventListener("keydown", onKey); setTimeout(() => root.remove(), 260);
  };
  const onKey = e => { if (e.key === "Escape" && !$(".overlay")) close(false); };
  document.addEventListener("keydown", onKey);
  $$("[data-close]", root).forEach(b => b.addEventListener("click", () => close(false)));
  $("[data-save]", root).addEventListener("click", async () => {
    if (S.uploads) return toast(t("busy"), "info");
    const fd = new FormData(form);
    for (const l of LANGS) { P.title[l] = String(fd.get(`title.${l}`) || "").trim(); P.location[l] = String(fd.get(`location.${l}`) || "").trim(); P.desc[l] = String(fd.get(`desc.${l}`) || "").trim(); }
    P.status = fd.get("status"); P.size = Math.max(0, +fd.get("size") || 0); P.year = +fd.get("year") || new Date().getFullYear();
    P.published = !!fd.get("published"); P.compare = !!fd.get("compare");
    if (!P.title.sq || !P.cover) { toast(t("req_title"), "err"); return; }
    if (!P.gallery.length) P.gallery = [P.cover];
    const id = P._doc || P.id || `${slug(P.title.sq)}-${Date.now().toString(36).slice(-4)}`;
    const data = { ...P, id: P.id || id, updatedAt: serverTimestamp() }; delete data._doc;
    const b = $("[data-save]", root); b.disabled = true; b.textContent = t("saving");
    try {
      await setDoc(doc(db, "projects", id), data);
      const still = JSON.stringify(data);
      for (const r of ed.removed) if (r && typeof r === "object" && !still.includes(r.path)) await removeFiles(r);
      await loadAll(); toast(t("saved")); close(true); tabProjects();
    } catch (e) { console.error(e); toast(permErr(e), "err", 5000); b.disabled = false; b.textContent = t("save"); }
  });
  $("input", form).focus({ preventScroll: true });
}

/* ================================================================== 2 · ARCHITECT */
function tabArchitect() {
  const base = settingsBase(); const A = clone(base.architect || {});
  A.role = A.role || {}; A.quote = A.quote || {}; A.bio = A.bio || {}; A.specialties = A.specialties || {};
  LANGS.forEach(l => { A.specialties[l] = (A.specialties[l] || []).concat([{}, {}, {}]).slice(0, 3).map(x => ({ t: x.t || "", d: x.d || "" })); });
  const p = $("#panel");
  p.innerHTML = `<div class="sec-h"><div><h2>${t("a_title")}</h2><p>${t("a_d")}</p></div></div>
    <form id="af" novalidate>
      <div class="box"><div class="grid2">
        <label class="field"><span>${t("a_name")}</span><input class="input" name="name" value="${esc(/^TODO/i.test(A.name || "") ? "" : A.name)}" placeholder="Arb. …"></label>
        <label class="field"><span>${t("a_years")}</span><input class="input" type="number" inputmode="numeric" min="0" max="80" name="experienceYears" value="${esc(A.experienceYears || 0)}"></label></div>
        <p class="flabel">${t("a_photo")}</p><div class="single" id="a-photo"></div><div class="prog" id="a-prog"></div>
      </div>
      <div class="box">${langTabs("a")}
        ${LANGS.map((l, i) => `<div class="lpane" data-lpane="a" data-lang="${l}"${i ? " hidden" : ""}>
          <label class="field"><span>${t("a_role")} · ${l.toUpperCase()}</span><input class="input" name="role.${l}" value="${esc(A.role[l])}"></label>
          <label class="field"><span>${t("a_quote")} · ${l.toUpperCase()}</span><textarea class="input" rows="2" name="quote.${l}">${esc(A.quote[l])}</textarea></label>
          <label class="field"><span>${t("a_bio")} · ${l.toUpperCase()}</span><textarea class="input" rows="5" name="bio.${l}">${esc(A.bio[l])}</textarea></label>
          ${[0, 1, 2].map(k => `<div class="grid2"><label class="field"><span>${t("a_spec")} 0${k + 1} · ${t("a_spec_t")}</span><input class="input" name="specialties.${l}.${k}.t" value="${esc(A.specialties[l][k].t)}"></label><label class="field"><span>${t("a_spec")} 0${k + 1} · ${t("a_spec_d")}</span><input class="input" name="specialties.${l}.${k}.d" value="${esc(A.specialties[l][k].d)}"></label></div>`).join("")}
        </div>`).join("")}
      </div></form>`;
  bindLangTabs(p);
  const f = $("#af"); f.addEventListener("input", () => markDirty(true));
  let photo = A.photo || "", added = null;
  const drawPhoto = () => {
    const el = $("#a-photo");
    el.innerHTML = (photo ? `<div class="imgs" style="grid-template-columns:minmax(0,220px)"><div class="img" style="aspect-ratio:4/5"><img src="${esc(thumb(photo))}" alt=""><div class="tools"><span></span><button type="button" data-rm aria-label="${esc(t("remove"))}">✕</button></div></div></div>` : "") + dropzone({ multiple: false, label: photo ? t("replace") : t("drop_one") });
    bindDrop($(".drop", el), async fs => { const up = await uploadImage(fs[0], "public/architect", $("#a-prog"), [1200, 480]); if (!up) return; added = up; photo = up; markDirty(true); drawPhoto(); });
    const rm = $("[data-rm]", el); if (rm) rm.addEventListener("click", () => { photo = ""; markDirty(true); drawPhoto(); });
  };
  drawPhoto();
  saveBar(async () => {
    const fd = new FormData(f), next = clone(A);
    for (const [k, v] of fd.entries()) setPath(next, k, typeof v === "string" ? v.trim() : v);
    next.experienceYears = Math.max(0, +fd.get("experienceYears") || 0);
    next.name = next.name || "TODO Emri Mbiemri";
    next.photo = photo || "";
    const old = base.architect && base.architect.photo;
    await saveSettings({ architect: next });
    if (old && typeof old === "object" && old !== photo && (!photo || old.path !== photo.path)) await removeFiles(old);
    added = null;
  }, async () => { if (added) await removeFiles(added); tabArchitect(); });
}

/* ================================================================== 3 · CONTACT & COMPANY */
function tabContact() {
  const s = settingsBase(), E = s.estimator || {}, tiers = E.tiers || {};
  const num = (name, v, step = "any") => `<input class="input" type="number" inputmode="decimal" step="${step}" name="${name}" value="${esc(v == null ? "" : v)}">`;
  const p = $("#panel");
  p.innerHTML = `<div class="sec-h"><div><h2>${t("c_title")}</h2><p>${t("c_d")}</p></div></div>
    <form id="cf" novalidate>
      <div class="box"><div class="grid2">
        <label class="field"><span>${t("c_phone")}</span><input class="input" name="phone" type="tel" value="${esc(s.phone)}" placeholder="+389 70 123 456"></label>
        <label class="field"><span>${t("c_phoneLink")}</span><input class="input" name="phoneLink" type="tel" value="${esc(s.phoneLink)}" placeholder="+38970123456"></label>
        <label class="field"><span>${t("c_whatsapp")}</span><input class="input" name="whatsapp" inputmode="numeric" value="${esc(s.whatsapp)}" placeholder="38970123456"></label>
        <label class="field"><span>${t("c_email")}</span><input class="input" name="email" type="email" inputmode="email" autocapitalize="off" value="${esc(s.email)}"></label></div>
        <label class="field"><span>${t("c_address")}</span><input class="input" name="address" value="${esc(s.address)}"></label>
        <div class="grid3">${LANGS.map(l => `<label class="field"><span>${t("c_hours")} · ${l.toUpperCase()}</span><input class="input" name="officeHours.${l}" value="${esc((s.officeHours || {})[l])}"></label>`).join("")}</div>
        <div class="grid2"><label class="field"><span>${t("c_fb")}</span><input class="input" name="facebook" type="url" inputmode="url" value="${esc(s.facebook)}"></label>
        <label class="field"><span>${t("c_ig")}</span><input class="input" name="instagram" type="url" inputmode="url" value="${esc(s.instagram)}"></label></div>
      </div>
      <div class="box"><h3>${t("c_est")}</h3><p class="hint">${t("c_est_d")}</p>
        <div class="grid3"><label class="field"><span>${t("e_min")}</span>${num("estimator.min", E.min, 10)}</label><label class="field"><span>${t("e_max")}</span>${num("estimator.max", E.max, 10)}</label><label class="field"><span>${t("e_step")}</span>${num("estimator.step", E.step, 5)}</label>
        <label class="field"><span>${t("e_start")}</span>${num("estimator.start", E.start, 10)}</label><label class="field"><span>${t("e_range")}</span>${num("estimator.range", E.range, .5)}</label></div>
        ${["structure", "standard", "premium"].map(k => `<p class="flabel" style="margin-top:8px">${t("tier_" + k)}</p><div class="grid3"><label class="field"><span>${t("e_base")}</span>${num(`estimator.tiers.${k}.base`, (tiers[k] || {}).base)}</label><label class="field"><span>${t("e_per")}</span>${num(`estimator.tiers.${k}.perM2`, (tiers[k] || {}).perM2, .001)}</label><label class="field"><span>${t("e_floor")}</span>${num(`estimator.tiers.${k}.extraFloor`, (tiers[k] || {}).extraFloor, .5)}</label></div>`).join("")}
      </div></form>`;
  const f = $("#cf"); f.addEventListener("input", e => {
    if (e.target.name === "phone" && !f.phoneLink.dataset.touched) f.phoneLink.value = e.target.value.replace(/[^\d+]/g, "");
    if (e.target.name === "phoneLink") f.phoneLink.dataset.touched = 1;
    markDirty(true);
  });
  saveBar(async () => {
    const fd = new FormData(f), next = { officeHours: {}, estimator: clone(E) };
    for (const [k, v] of fd.entries()) {
      const val = k.startsWith("estimator.") ? (v === "" ? undefined : Number(v)) : String(v).trim();
      if (val !== undefined) setPath(next, k, val);
    }
    next.whatsapp = String(next.whatsapp || "").replace(/\D/g, "");
    await saveSettings(next);
  }, () => tabContact());
}

/* ================================================================== 4 · 3D MODELS & BACKUP */
function tabModels() {
  const s = settingsBase(), M = s.models || {};
  const p = $("#panel");
  const slotBox = (k, label) => `<div class="box"><h3>${label}</h3>
    <label class="field"><span>${t("m_url")}</span><input class="input" name="${k}" type="url" inputmode="url" value="${esc(M[k] || "")}" placeholder="assets/models/${k}.glb"></label>
    <div data-glb="${k}">${dropzone({ multiple: false, accept: ".glb,model/gltf-binary", label: t("m_upload") })}</div></div>`;
  p.innerHTML = `<div class="sec-h"><div><h2>${t("m_title")}</h2><p>${t("m_d")}</p></div></div>
    <form id="mf" novalidate>${slotBox("house", t("m_house"))}${slotBox("scale", t("m_scale"))}<div class="prog" id="m-prog"></div></form>
    <div class="box"><h3>${t("m_backup")}</h3><p class="hint">${t("m_backup_d")}</p>
      <div style="display:flex;flex-wrap:wrap;gap:10px"><button type="button" class="btn btn-primary" id="backup">↓ ${t("m_download")}</button><a class="btn btn-ghost" href="../index.html" target="_blank" rel="noopener">↗ ${t("view_site")}</a><button type="button" class="btn btn-ghost" id="so2">${t("signout")}</button></div></div>`;
  const f = $("#mf"); f.addEventListener("input", () => markDirty(true));
  $$("[data-glb]", p).forEach(el => bindDrop($(".drop", el), async fs => {
    const file = fs[0]; if (!/\.glb$/i.test(file.name) || file.size > 15 * 1024 * 1024) return toast(t("m_glb_err"), "err");
    S.uploads++;
    const row = document.createElement("div"); row.className = "prog-row"; row.innerHTML = `<span>${t("uploading")} · ${esc(file.name)}</span><b class="mono">0%</b><span class="bar"><i></i></span>`; $("#m-prog").appendChild(row);
    try {
      const url = await put(`public/models/${Date.now().toString(36)}-${slug(file.name.replace(/\.glb$/i, ""))}.glb`, new Blob([file], { type: "model/gltf-binary" }), pr => { $(".bar i", row).style.transform = `scaleX(${pr})`; $("b", row).textContent = Math.round(pr * 100) + "%"; });
      f[el.dataset.glb].value = url; markDirty(true); setTimeout(() => row.remove(), 800);
    } catch (e) { row.remove(); toast(permErr(e), "err", 5000); }
    finally { S.uploads--; }
  }));
  $("#backup").addEventListener("click", downloadBackup);
  $("#so2").addEventListener("click", () => $("#signout").click());
  saveBar(async () => {
    const next = { ...clone(M), house: f.house.value.trim() || null, scale: f.scale.value.trim() || null };
    await saveSettings({ models: next });
  }, () => tabModels());
}

/* config.js backup: local defaults + everything in Firestore, ready to drop into js/config.js */
function downloadBackup() {
  const s = settingsBase(), out = clone(LOCAL);
  for (const k of ["phone", "phoneLink", "whatsapp", "email", "address", "officeHours", "facebook", "instagram"]) if (s[k] !== undefined) out[k] = s[k];
  out.architect = { ...(LOCAL.architect || {}), ...s.architect };
  out.models = { ...(LOCAL.models || {}), ...s.models };
  out.estimator = clone(LOCAL.estimator || {});
  const E = s.estimator || {};
  for (const k of ["min", "max", "step", "start", "range"]) if (E[k] !== undefined) out.estimator[k] = E[k];
  for (const k of Object.keys(out.estimator.tiers || {})) Object.assign(out.estimator.tiers[k], (E.tiers || {})[k] || {}, { items: out.estimator.tiers[k].items });
  if (S.projects.length) out.projects = S.projects.filter(p => p.published !== false).map(p => { const c = clone(p); delete c._doc; delete c.updatedAt; delete c.order; delete c.published; return c; });
  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  const body = `/* =========================================================
   LASTRA PROJEKT – SITE CONFIG
   Backup exported from the admin panel on ${stamp}.
   Drop this file into js/config.js to use the data without Firebase.
   Images uploaded through the panel are referenced by their Firebase Storage URLs.
   ========================================================= */
window.SITE = ${JSON.stringify(out, null, 2)};
`;
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([body], { type: "text/javascript" })); a.download = "config.js";
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  toast(t("m_dl_ok"));
}

/* ------------------------------------------------------------------ boot */
document.documentElement.lang = ui;
if (READY) onAuthStateChanged(auth, async user => {
  S.user = user;
  if (!user) { S.dirty = {}; return renderLogin(); }
  app.innerHTML = `<div class="boot"><span class="mark">L</span><p class="mono">${t("loading")}</p></div>`;
  try { await loadAll(); }
  catch (e) { console.error(e); toast(permErr(e), "err", 6000); S.settings = null; S.projects = []; }
  renderDash();
});
