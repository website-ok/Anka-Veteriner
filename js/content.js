// İçerik yükleyici (modül).
// Öncelik: Firestore (canlı, panelden kaydedilen) -> content.json (varsayılan/yedek).
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig, isConfigured } from "./firebase-config.js";

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escAttr(s) {
  return esc(s).replace(/"/g, "&quot;");
}

function ytId(u) {
  u = String(u || "").trim();
  const m = u.match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  if (m) return m[1];
  if (/^[A-Za-z0-9_-]{11}$/.test(u)) return u;
  return "";
}

function apply(c) {
  if (!c) return;

  // Telefon / WhatsApp linklerini güncelle
  const wa = String(c.whatsapp || "").replace(/\D/g, "");
  if (wa) {
    document.querySelectorAll('a[href^="tel:"]').forEach((a) => {
      a.setAttribute("href", "tel:+" + wa);
    });
    document.querySelectorAll('a[href*="wa.me"]').forEach((a) => {
      const q = a.getAttribute("href").split("?")[1];
      a.setAttribute("href", "https://wa.me/" + wa + (q ? "?" + q : ""));
    });
  }

  // Basit metin alanları
  document.querySelectorAll("[data-bind]").forEach((el) => {
    const key = el.getAttribute("data-bind");
    if (c[key] != null && c[key] !== "") el.textContent = c[key];
  });

  // Toplam yorum sayısı (Google + Yandex)
  const total = (parseInt(c.googleCount, 10) || 0) + (parseInt(c.yandexCount, 10) || 0);
  document.querySelectorAll("[data-total]").forEach((el) => {
    el.textContent = total;
  });

  // Hero görseli
  if (c.heroImage) {
    document.querySelectorAll("[data-hero-img]").forEach((el) => {
      el.setAttribute("src", c.heroImage);
    });
  }

  // Kart / liste bölümleri
  renderCards("why-cards", c.whyCards);
  renderCards("featured-cards", c.featured);
  renderServiceGroups("service-groups", c.serviceGroups);
  renderReviews("reviews", c.reviews);
  renderGallery("gallery-grid", c.gallery, 0);
  renderGallery("gallery-preview", c.gallery, 3);
}

function renderCards(id, list) {
  const el = document.getElementById(id);
  if (!el || !Array.isArray(list) || !list.length) return;
  el.innerHTML = list
    .map(
      (c) =>
        `<div class="card"><div class="icon">${esc(c.icon)}</div>` +
        `<h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></div>`
    )
    .join("");
}

function renderServiceGroups(id, list) {
  const el = document.getElementById(id);
  if (!el || !Array.isArray(list) || !list.length) return;
  el.innerHTML = list
    .map(
      (g) =>
        `<div class="service-group"><h3><span>${esc(g.icon)}</span> ${esc(g.title)}</h3>` +
        `<ul>${(g.items || []).map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>`
    )
    .join("");
}

function renderReviews(id, list) {
  const el = document.getElementById(id);
  if (!el || !Array.isArray(list) || !list.length) return;
  el.innerHTML = list
    .map((r) => {
      const initial = String(r.initial || (r.name || "?").charAt(0) || "?");
      return (
        `<div class="review"><span class="stars">★★★★★</span><p>${esc(r.text)}</p>` +
        `<div class="reviewer"><span class="avatar">${esc(initial)}</span><div>` +
        `<strong>${esc(r.name)}</strong><small>${esc(r.source || "")}</small></div></div></div>`
      );
    })
    .join("");
}

function mediaHTML(m) {
  if (!m || !m.src) return "";
  const cap = m.caption ? `<div class="media-cap">${esc(m.caption)}</div>` : "";
  if (m.type === "youtube") {
    const id = ytId(m.src);
    if (!id) return "";
    return (
      `<div class="media-item"><div class="media-embed">` +
      `<iframe src="https://www.youtube.com/embed/${id}" loading="lazy" allowfullscreen ` +
      `title="${escAttr(m.caption || "Video")}"></iframe></div>${cap}</div>`
    );
  }
  if (m.type === "video") {
    return `<div class="media-item"><video controls preload="metadata" src="${escAttr(m.src)}"></video>${cap}</div>`;
  }
  return `<div class="media-item"><img loading="lazy" src="${escAttr(m.src)}" alt="${escAttr(m.caption || "Görsel")}">${cap}</div>`;
}

function renderGallery(id, list, limit) {
  const el = document.getElementById(id);
  if (!el || !Array.isArray(list)) return;
  const items = limit ? list.slice(0, limit) : list;
  el.innerHTML = items.map(mediaHTML).join("");
}

function loadFromJson() {
  fetch("content.json")
    .then((r) => (r.ok ? r.json() : null))
    .then((c) => apply(c))
    .catch(() => {});
}

// Firestore varsa canlı dinle; yoksa content.json'a düş.
if (isConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    onSnapshot(
      doc(db, "site", "content"),
      (snap) => {
        if (snap.exists()) apply(snap.data());
        else loadFromJson();
      },
      () => loadFromJson()
    );
  } catch (e) {
    loadFromJson();
  }
} else {
  loadFromJson();
}
