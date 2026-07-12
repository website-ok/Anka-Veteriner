// Vet Anka — Yönetim Paneli (Firebase)
// Giriş: Firebase Auth (e-posta/şifre). Kaydet: Firestore'a yazar -> tüm ziyaretçilerde canlı.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseConfig, isConfigured } from "./firebase-config.js";

const SCALARS = [
  "clinicName", "phone", "whatsapp", "addressLine1", "addressLine2", "hours",
  "googleScore", "googleCount", "yandexScore", "yandexCount",
  "heroEyebrow", "heroTitle", "heroLead", "footerAbout", "heroImage",
];

const MEDIA_LABELS = { image: "Görsel", video: "Video", youtube: "YouTube" };
const MEDIA_SRC_LABELS = {
  image: "Görsel yolu / URL (ya da aşağıdan dosya seçin)",
  video: "Video (mp4) yolu veya URL",
  youtube: "YouTube linki veya video ID",
};

const LISTS = {
  whyCards: { label: "Kart", fields: [["icon", "Simge", "input", "icon-input"], ["title", "Başlık", "input"], ["text", "Metin", "textarea"]] },
  featured: { label: "Kart", fields: [["icon", "Simge", "input", "icon-input"], ["title", "Başlık", "input"], ["text", "Metin", "textarea"]] },
  serviceGroups: { label: "Grup", fields: [["icon", "Simge", "input", "icon-input"], ["title", "Grup başlığı", "input"], ["items", "Hizmetler (her satıra bir tane)", "textarea"]] },
  reviews: { label: "Yorum", fields: [["name", "İsim", "input"], ["source", "Kaynak (ör. Google · 5/5)", "input"], ["text", "Yorum", "textarea"]] },
};

const $ = (id) => document.getElementById(id);

function escAttr(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escText(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2600);
}
function setPreview(img, src) {
  if (!img) return;
  if (src) img.setAttribute("src", src);
  else img.removeAttribute("src");
}

/* ---------- Firebase ---------- */
let db = null;
let auth = null;
if (isConfigured) {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
}
const CONTENT_DOC = () => doc(db, "site", "content");

/* ---------- Ekran geçişleri ---------- */
function showPanel() {
  $("login").style.display = "none";
  $("panel").style.display = "block";
  loadContent();
}
function showLogin() {
  $("panel").style.display = "none";
  $("login").style.display = "flex";
}

/* ---------- Giriş ---------- */
$("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  if (!isConfigured) return;
  const email = $("u").value.trim();
  const pass = $("p").value;
  $("login-error").textContent = "";
  signInWithEmailAndPassword(auth, email, pass).catch(() => {
    $("login-error").textContent = "E-posta veya şifre hatalı.";
  });
});

/* ---------- İçerik yükleme ---------- */
function loadContent() {
  getDoc(CONTENT_DOC())
    .then((snap) => {
      if (snap.exists()) renderAll(snap.data());
      else loadSeed();
    })
    .catch(() => loadSeed());
}
function loadSeed() {
  fetch("content.json")
    .then((r) => (r.ok ? r.json() : {}))
    .then((c) => renderAll(c))
    .catch(() => renderAll({}));
}

function renderAll(c) {
  SCALARS.forEach((k) => { if ($("f-" + k)) $("f-" + k).value = c[k] || ""; });
  Object.keys(LISTS).forEach((name) => renderList(name, Array.isArray(c[name]) ? c[name] : []));
  setPreview($("hero-preview"), c.heroImage);
  renderGallery(Array.isArray(c.gallery) ? c.gallery : []);
}

/* ---------- Sabit listeler ---------- */
function itemHTML(name, idx, item) {
  const def = LISTS[name];
  let inner = "";
  def.fields.forEach(([key, label, kind, cls]) => {
    let val = item[key];
    if (key === "items" && Array.isArray(val)) val = val.join("\n");
    const control =
      kind === "textarea"
        ? `<textarea data-field="${key}">${escText(val)}</textarea>`
        : `<input type="text" class="${cls || ""}" data-field="${key}" value="${escAttr(val)}">`;
    inner += `<div class="field"><label>${label}</label>${control}</div>`;
  });
  return (
    `<div class="admin-item">` +
    `<div class="item-head"><span>${def.label} ${idx + 1}</span>` +
    `<button type="button" class="btn-remove" data-remove="${name}" data-idx="${idx}">✕ Sil</button></div>` +
    inner +
    `</div>`
  );
}
function renderList(name, list) {
  $("list-" + name).innerHTML = list.map((item, i) => itemHTML(name, i, item)).join("");
}
function collectList(name) {
  return Array.from($("list-" + name).querySelectorAll(".admin-item")).map((row) => {
    const obj = {};
    row.querySelectorAll("[data-field]").forEach((f) => {
      const key = f.getAttribute("data-field");
      if (key === "items") obj.items = f.value.split("\n").map((s) => s.trim()).filter(Boolean);
      else obj[key] = f.value;
    });
    return obj;
  });
}

/* ---------- Galeri (medya) ---------- */
function galleryItemHTML(item, idx) {
  const type = item.type || "image";
  const isImage = type === "image";
  const src = item.src || "";
  const fileBtn = isImage
    ? `<div class="media-tools">` +
      `<button type="button" class="btn-file media-pick">📁 Dosya seç</button>` +
      `<input type="file" accept="image/*" hidden class="media-file">` +
      `<img class="media-prev"${src ? ` src="${escAttr(src)}"` : ""} alt=""></div>`
    : "";
  return (
    `<div class="admin-item" data-mtype="${type}">` +
    `<div class="item-head"><span>${MEDIA_LABELS[type] || "Öğe"} ${idx + 1}</span>` +
    `<button type="button" class="btn-remove" data-remove-media>✕ Sil</button></div>` +
    `<div class="field"><label>${MEDIA_SRC_LABELS[type]}</label>` +
    `<input type="text" data-field="src" value="${escAttr(src)}">${fileBtn}</div>` +
    `<div class="field"><label>Açıklama (isteğe bağlı)</label>` +
    `<input type="text" data-field="caption" value="${escAttr(item.caption || "")}"></div>` +
    `</div>`
  );
}
function renderGallery(list) {
  $("list-gallery").innerHTML = list.map(galleryItemHTML).join("");
}
function collectGallery() {
  return Array.from($("list-gallery").querySelectorAll(".admin-item")).map((row) => ({
    type: row.getAttribute("data-mtype") || "image",
    src: (row.querySelector('[data-field="src"]') || {}).value || "",
    caption: (row.querySelector('[data-field="caption"]') || {}).value || "",
  }));
}

function collectAll() {
  const c = {};
  SCALARS.forEach((k) => { c[k] = $("f-" + k) ? $("f-" + k).value : ""; });
  Object.keys(LISTS).forEach((name) => { c[name] = collectList(name); });
  c.gallery = collectGallery();
  return c;
}

/* ---------- Ekle / Sil / Dosya seç ---------- */
document.addEventListener("click", (e) => {
  const add = e.target.closest("[data-add]");
  if (add) {
    const name = add.getAttribute("data-add");
    const list = collectList(name);
    list.push({});
    renderList(name, list);
    return;
  }
  const rem = e.target.closest("[data-remove]");
  if (rem) {
    const name = rem.getAttribute("data-remove");
    const list = collectList(name);
    list.splice(parseInt(rem.getAttribute("data-idx"), 10), 1);
    renderList(name, list);
    return;
  }
  const addM = e.target.closest("[data-add-media]");
  if (addM) {
    const list = collectGallery();
    list.push({ type: addM.getAttribute("data-add-media"), src: "", caption: "" });
    renderGallery(list);
    return;
  }
  const remM = e.target.closest("[data-remove-media]");
  if (remM) {
    const row = remM.closest(".admin-item");
    const idx = Array.from($("list-gallery").children).indexOf(row);
    const list = collectGallery();
    list.splice(idx, 1);
    renderGallery(list);
    return;
  }
  const pick = e.target.closest("[data-pick]");
  if (pick) {
    $(pick.getAttribute("data-pick")).click();
    return;
  }
  const mpick = e.target.closest(".media-pick");
  if (mpick) {
    const file = mpick.parentNode.querySelector(".media-file");
    if (file) file.click();
  }
});

function readFileAsDataURL(file, cb) {
  const reader = new FileReader();
  reader.onload = () => cb(reader.result);
  reader.readAsDataURL(file);
}

document.addEventListener("change", (e) => {
  if (e.target.id === "hero-file" && e.target.files[0]) {
    readFileAsDataURL(e.target.files[0], (data) => {
      $("f-heroImage").value = data;
      setPreview($("hero-preview"), data);
    });
    e.target.value = "";
    return;
  }
  if (e.target.classList.contains("media-file") && e.target.files[0]) {
    const item = e.target.closest(".admin-item");
    readFileAsDataURL(e.target.files[0], (data) => {
      const srcInput = item.querySelector('[data-field="src"]');
      const prev = item.querySelector(".media-prev");
      if (srcInput) srcInput.value = data;
      if (prev) setPreview(prev, data);
    });
    e.target.value = "";
  }
});

/* ---------- Kaydet / Yedek / Çıkış ---------- */
$("btn-save").addEventListener("click", () => {
  const btn = $("btn-save");
  btn.disabled = true;
  setDoc(CONTENT_DOC(), collectAll())
    .then(() => toast("Kaydedildi ✓ Değişiklikler yayında."))
    .catch((err) => {
      if (String(err).includes("longer than") || String(err).includes("1048576"))
        toast("Belge çok büyük. Görselleri URL ile ekleyin veya küçültün.");
      else toast("Kaydedilemedi. Bağlantınızı kontrol edin.");
    })
    .finally(() => { btn.disabled = false; });
});

$("btn-download").addEventListener("click", () => {
  const data = JSON.stringify(collectAll(), null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "content.json";
  a.click();
  URL.revokeObjectURL(a.href);
  toast("Yedek (content.json) indirildi");
});

$("btn-logout").addEventListener("click", () => {
  if (auth) signOut(auth);
});

/* ---------- Başlangıç ---------- */
if (!isConfigured) {
  showLogin();
  $("login-error").innerHTML =
    "⚠️ Firebase kurulumu tamamlanmadı.<br>Lütfen <strong>KURULUM.md</strong> adımlarını izleyip <code>js/firebase-config.js</code> dosyasını doldurun.";
  $("login-form").querySelector("button[type=submit]").disabled = true;
} else {
  onAuthStateChanged(auth, (user) => {
    if (user) showPanel();
    else showLogin();
  });
}
