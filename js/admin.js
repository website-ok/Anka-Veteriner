// Vet Anka — Yönetim Paneli (lokal, backend yok).
// Giriş: basit yerel şifre. Kaydet: localStorage'a yazar -> açık site sekmesi anında güncellenir.
// İçeriği kalıcı yapmak için "Yedek indir" ile content.json'u alıp yayınlayın (GitHub).

const LS_KEY = "anka_content";
const SESSION_KEY = "anka_admin";
// Demo giriş bilgileri — canlıya alırken değiştirin. (Lokal demo olduğu için istemci tarafında.)
const ADMIN_EMAIL = "admin@ankaveteriner.com";
const ADMIN_PASSWORD = "anka1234";

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

/* ---------- Giriş (yerel şifre) ---------- */
$("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  $("login-error").textContent = "";
  const email = $("u").value.trim().toLowerCase();
  if (email === ADMIN_EMAIL.toLowerCase() && $("p").value === ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, "1");
    showPanel();
  } else {
    $("login-error").textContent = "E-posta veya şifre hatalı.";
  }
});

/* ---------- İçerik yükleme ---------- */
function loadContent() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) { renderAll(JSON.parse(raw)); return; }
  } catch (e) {}
  loadSeed();
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
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(collectAll()));
    toast("Kaydedildi ✓ Açık site sekmesinde anında güncellendi.");
  } catch (err) {
    toast("Kaydedilemedi: içerik çok büyük olabilir. Gömülü görseller yerine img/ yolu kullanın.");
  }
});

$("btn-download").addEventListener("click", () => {
  const data = JSON.stringify(collectAll(), null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "content.json";
  a.click();
  URL.revokeObjectURL(a.href);
  toast("content.json indirildi — kalıcı yapmak için repoya koyup yayınlayın.");
});

$("btn-logout").addEventListener("click", () => {
  sessionStorage.removeItem(SESSION_KEY);
  showLogin();
});

/* ---------- Başlangıç ---------- */
if (sessionStorage.getItem(SESSION_KEY)) showPanel();
else showLogin();
