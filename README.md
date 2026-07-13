# Vet Anka Veteriner Kliniği — Web Sitesi

Sefaköy, Küçükçekmece'deki Vet Anka Veteriner Kliniği için tanıtım ve iletişim amaçlı,
mobil uyumlu **statik** web sitesi. İçerik `content.json` içindedir ve `/admin`
(Decap CMS) üzerinden düzenlenir. Barındırma: **Cloudflare Pages**.

## Mimari

- **Statik site** — HTML + CSS + JS, derleme adımı yok.
- **İçerik:** tek dosya `content.json`. Site bunu `js/content.js` ile okuyup render eder.
- **Yönetim paneli:** `/admin` (Decap CMS). Düzenleme → `content.json`'a **GitHub commit** →
  Cloudflare Pages otomatik yeniden yayınlar → değişiklik **tüm ziyaretçilerde** görünür.

## Sayfalar

- `index.html` — Ana sayfa (tanıtım, hizmetler, yorumlar, galeri önizleme)
- `hizmetler.html` — Tüm hizmetlerin kategorili listesi
- `galeri.html` — Fotoğraf / video / YouTube galerisi
- `iletisim.html` — Adres, telefon, WhatsApp, harita ve yol tarifi
- `admin/` — Yönetim paneli (Decap CMS, GitHub ile giriş)

## Yerelde çalıştırma / demo

İki terminal:

```bash
# 1) Decap yerel backend (GitHub/OAuth gerekmez):
npx decap-server

# 2) Statik sunucu (venv aktifken):
python Anka-Veteriner/scripts/serve.py
```

- Site: `http://localhost:8000`
- Panel: `http://localhost:8000/admin/` → düzenle → **Publish** → `content.json`
  yerelde güncellenir → siteyi yenile.

## Canlıya alma

Cloudflare Pages + GitHub OAuth kurulumu ve Metunic domain bağlama adımları:
[CLOUDFLARE.md](CLOUDFLARE.md).

## Teknik

- HTML + CSS + JavaScript (framework/bağımlılık yok)
- Decap CMS (CDN), Google Fonts (Poppins, Inter), Google Maps embed
- Mobil menü ve kaydırma animasyonları için küçük bir `js/site.js`

## İletişim

- Telefon / WhatsApp: 0507 788 17 45
- Adres: Tevfik Bey Mah. Mektep Sk. No:19, Sefaköy, 34295 Küçükçekmece / İstanbul
