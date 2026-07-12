// Vet Anka — Yönetim Paneli
// Basit istemci tarafı içerik editörü. Not: admin/1234 girişi statik bir sitede
// tam güvenlik sağlamaz; yalnızca içerik düzenlemeyi kolaylaştıran basit bir kilittir.
(function () {
  const KEY = "ankaContent";
  const AUTH = "ankaAuth";
  const USER = "admin";
  const PASS = "1234";

  const SCALARS = [
    "clinicName", "phone", "whatsapp", "addressLine1", "addressLine2", "hours",
    "googleScore", "googleCount", "yandexScore", "yandexCount",
    "heroEyebrow", "heroTitle", "heroLead", "footerAbout",
  ];

  const LISTS = {
    whyCards: {
      label: "Kart",
      fields: [["icon", "Simge", "input", "icon-input"], ["title", "Başlık", "input"], ["text", "Metin", "textarea"]],
    },
    featured: {
      label: "Kart",
      fields: [["icon", "Simge", "input", "icon-input"], ["title", "Başlık", "input"], ["text", "Metin", "textarea"]],
    },
    serviceGroups: {
      label: "Grup",
      fields: [["icon", "Simge", "input", "icon-input"], ["title", "Grup başlığı", "input"], ["items", "Hizmetler (her satıra bir tane)", "textarea"]],
    },
    reviews: {
      label: "Yorum",
      fields: [["name", "İsim", "input"], ["source", "Kaynak (ör. Google · 5/5)", "input"], ["text", "Yorum", "textarea"]],
    },
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
    setTimeout(() => t.classList.remove("show"), 2200);
  }

  /* ---------- Kimlik doğrulama ---------- */
  function showPanel() {
    $("login").style.display = "none";
    $("panel").style.display = "block";
    loadContent();
  }

  function showLogin() {
    $("panel").style.display = "none";
    $("login").style.display = "flex";
  }

  $("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if ($("u").value.trim() === USER && $("p").value === PASS) {
      sessionStorage.setItem(AUTH, "1");
      $("login-error").textContent = "";
      showPanel();
    } else {
      $("login-error").textContent = "Kullanıcı adı veya şifre hatalı.";
    }
  });

  /* ---------- İçerik yükleme ---------- */
  function loadContent() {
    let stored = null;
    try { stored = JSON.parse(localStorage.getItem(KEY)); } catch (e) { stored = null; }
    if (stored) {
      renderAll(stored);
    } else {
      fetch("content.json")
        .then((r) => (r.ok ? r.json() : {}))
        .then((c) => renderAll(c))
        .catch(() => renderAll({}));
    }
  }

  function renderAll(c) {
    SCALARS.forEach((k) => { if ($("f-" + k)) $("f-" + k).value = c[k] || ""; });
    Object.keys(LISTS).forEach((name) => renderList(name, Array.isArray(c[name]) ? c[name] : []));
  }

  /* ---------- Dinamik listeler ---------- */
  function itemHTML(name, idx, item) {
    const def = LISTS[name];
    let inner = "";
    def.fields.forEach(([key, label, kind, cls]) => {
      let val = item[key];
      if (key === "items" && Array.isArray(val)) val = val.join("\n");
      const extra = cls ? " " + cls : "";
      const control =
        kind === "textarea"
          ? `<textarea data-field="${key}">${escText(val)}</textarea>`
          : `<input type="text" class="${extra.trim()}" data-field="${key}" value="${escAttr(val)}">`;
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
    const el = $("list-" + name);
    el.innerHTML = list.map((item, i) => itemHTML(name, i, item)).join("");
  }

  function collectList(name) {
    const el = $("list-" + name);
    return Array.from(el.querySelectorAll(".admin-item")).map((row) => {
      const obj = {};
      row.querySelectorAll("[data-field]").forEach((f) => {
        const key = f.getAttribute("data-field");
        if (key === "items") {
          obj.items = f.value.split("\n").map((s) => s.trim()).filter(Boolean);
        } else {
          obj[key] = f.value;
        }
      });
      return obj;
    });
  }

  function collectAll() {
    const c = {};
    SCALARS.forEach((k) => { c[k] = $("f-" + k) ? $("f-" + k).value : ""; });
    Object.keys(LISTS).forEach((name) => { c[name] = collectList(name); });
    return c;
  }

  /* Ekle / Sil (delege) */
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
    }
  });

  /* ---------- Eylemler ---------- */
  $("btn-save").addEventListener("click", () => {
    localStorage.setItem(KEY, JSON.stringify(collectAll()));
    toast("Kaydedildi ✓ (bu cihazda canlı)");
  });

  $("btn-download").addEventListener("click", () => {
    const data = JSON.stringify(collectAll(), null, 2);
    localStorage.setItem(KEY, data);
    const blob = new Blob([data], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "content.json";
    a.click();
    URL.revokeObjectURL(a.href);
    toast("content.json indirildi");
  });

  $("btn-upload").addEventListener("click", () => $("file-input").click());
  $("file-input").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const c = JSON.parse(reader.result);
        localStorage.setItem(KEY, JSON.stringify(c));
        renderAll(c);
        toast("Dosya yüklendi");
      } catch (err) {
        toast("Geçersiz JSON dosyası");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  $("btn-reset").addEventListener("click", () => {
    if (!confirm("Tüm değişiklikler silinip content.json'daki varsayılan içeriğe dönülecek. Emin misiniz?")) return;
    localStorage.removeItem(KEY);
    fetch("content.json")
      .then((r) => (r.ok ? r.json() : {}))
      .then((c) => { renderAll(c); toast("Varsayılana dönüldü"); })
      .catch(() => renderAll({}));
  });

  $("btn-logout").addEventListener("click", () => {
    sessionStorage.removeItem(AUTH);
    showLogin();
  });

  /* ---------- Başlangıç ---------- */
  if (sessionStorage.getItem(AUTH) === "1") {
    showPanel();
  } else {
    showLogin();
  }
})();
