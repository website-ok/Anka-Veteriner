// İçerik yükleyici: admin panelinden yapılan değişiklikleri (localStorage) veya
// content.json'daki varsayılan içeriği sayfaya uygular.
(function () {
  const KEY = "ankaContent";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
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

    // Kart / liste bölümleri
    renderCards("why-cards", c.whyCards);
    renderCards("featured-cards", c.featured);
    renderServiceGroups("service-groups", c.serviceGroups);
    renderReviews("reviews", c.reviews);
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

  // Önce localStorage, yoksa content.json
  let stored = null;
  try {
    stored = JSON.parse(localStorage.getItem(KEY));
  } catch (e) {
    stored = null;
  }

  if (stored) {
    apply(stored);
  } else {
    fetch("content.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((c) => apply(c))
      .catch(() => {});
  }
})();
