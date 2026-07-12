# Vet Anka Veteriner Kliniği — Web Sitesi

**🌐 Canlı site:** https://anka-veteriner-22f10.web.app
**🔐 Yönetim paneli:** https://anka-veteriner-22f10.web.app/admin.html

Sefaköy, Küçükçekmece'deki Vet Anka Veteriner Kliniği için tanıtım ve iletişim amaçlı,
mobil uyumlu web sitesi. İçerik, giriş korumalı bir yönetim panelinden düzenlenir ve
**Kaydet'e basıldığında tüm ziyaretçilerde anında canlı** olur (Firebase Firestore).

## Sayfalar

- `index.html` — Ana sayfa (tanıtım, hizmetler, yorumlar, galeri önizleme)
- `hizmetler.html` — Tüm hizmetlerin kategorili listesi
- `galeri.html` — Fotoğraf / video / YouTube galerisi
- `iletisim.html` — Adres, telefon, WhatsApp, harita ve yol tarifi
- `admin.html` — Yönetim paneli (Firebase Auth ile giriş)

## Yönetim paneli

- Giriş: Firebase Authentication (e-posta / şifre)
- Düzenlenebilenler: iletişim bilgileri, çalışma saati, puanlar, ana sayfa metinleri,
  "Neden biz" kartları, öne çıkan hizmetler, hizmet grupları, yorumlar, hero görseli
  ve galeri (görsel / video / YouTube ekle-çıkar).
- **Kaydet** → Firestore'a yazar → tüm ziyaretçilerde anında yansır.

## Kurulum

Yönetim panelinin canlı çalışması için tek seferlik Firebase kurulumu gerekir.
Adımlar: [KURULUM.md](KURULUM.md). Kurulum tamamlanana kadar site,
`content.json` içindeki varsayılan içerikle sorunsuz çalışır.

## İçerik akışı

- **content.js** içeriği önce Firestore'dan (canlı), yoksa `content.json`'dan okur.
- **admin.js** panelden yapılan düzenlemeyi Firestore'a yazar.
- `content.json` varsayılan/yedek içeriktir; Firebase kurulmadan da site dolu görünür.

## Yerelde çalıştırma

```bash
# venv aktifken, proje kökünden:
python Anka-Veteriner/scripts/serve.py
```

Tarayıcıda `http://localhost:8000` açın. (Firebase JS SDK CDN'den yüklenir; internet gerekir.)

## Teknik

- HTML + CSS + JavaScript (framework yok), Firebase JS SDK (CDN, modül)
- Google Fonts (Poppins, Inter), Google Maps embed
- Mobil menü ve kaydırma animasyonları için küçük bir `js/site.js`

## İletişim

- Telefon / WhatsApp: 0507 788 17 45
- Adres: Tevfik Bey Mah. Mektep Sk. No:19, Sefaköy, 34295 Küçükçekmece / İstanbul
