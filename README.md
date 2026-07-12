# Vet Anka Veteriner Kliniği — Web Sitesi

Sefaköy, Küçükçekmece'deki Vet Anka Veteriner Kliniği için tanıtım ve iletişim amaçlı,
mobil uyumlu **statik** web sitesi. Backend yoktur; içerik giriş korumalı bir yönetim
panelinden düzenlenir. **Kaydet'e basıldığında açık olan site sekmesi anında güncellenir.**

## Sayfalar

- `index.html` — Ana sayfa (tanıtım, hizmetler, yorumlar, galeri önizleme)
- `hizmetler.html` — Tüm hizmetlerin kategorili listesi
- `galeri.html` — Fotoğraf / video / YouTube galerisi
- `iletisim.html` — Adres, telefon, WhatsApp, harita ve yol tarifi
- `admin.html` — Yönetim paneli (yerel şifre ile giriş)

## Yönetim paneli

- Giriş: yerel e-posta + şifre (demo bilgileri `js/admin.js` içinde `ADMIN_EMAIL` / `ADMIN_PASSWORD`).
- Düzenlenebilenler: iletişim bilgileri, çalışma saati, puanlar, ana sayfa metinleri,
  "Neden biz" kartları, öne çıkan hizmetler, hizmet grupları, yorumlar, hero görseli
  ve galeri (görsel / video / YouTube ekle-çıkar).
- **Kaydet** → değişiklik tarayıcının `localStorage`'ına yazılır; açık olan site
  sekmesi anında güncellenir (aynı tarayıcı/cihaz).
- **content.json indir** → o anki içeriği `content.json` olarak indirir.

## İçeriği kalıcı yapmak (herkese açık)

`localStorage` yalnızca o tarayıcıda geçerlidir. Değişikliği kalıcı ve herkese açık
yapmak için:

1. Panelde düzenle → **content.json indir**.
2. İnen dosyayı proje kökündeki `content.json` ile değiştir.
3. GitHub'a commit + push et (yayında olan kopya güncellenir).

## İçerik akışı

- **content.js** içeriği önce `localStorage`'dan (panelden kaydedilen), yoksa
  `content.json`'dan okur. Başka sekmede Kaydet'e basılınca `storage` olayıyla canlı güncellenir.
- **admin.js** panelden yapılan düzenlemeyi `localStorage`'a yazar; `content.json` olarak indirtir.
- `content.json` varsayılan/kaynak içeriktir; panel hiç kullanılmadan da site dolu görünür.

## Yerelde çalıştırma

```bash
# venv aktifken, proje kökünden:
python Anka-Veteriner/scripts/serve.py
```

Tarayıcıda `http://localhost:8000` açın. Demo akışı: bir sekmede `index.html`,
başka sekmede `admin.html` açın; panelde düzenleyip **Kaydet**'e basın → site sekmesi
anında değişir.

## Canlıya alma

Statik site olduğu için herhangi bir statik barındırmaya (GitHub Pages, Netlify,
satın alınan hosting + domain) dosyaları kopyalamak yeterlidir; ekstra kurulum yoktur.

## Teknik

- HTML + CSS + JavaScript (framework/bağımlılık yok)
- Google Fonts (Poppins, Inter), Google Maps embed
- Mobil menü ve kaydırma animasyonları için küçük bir `js/site.js`

## İletişim

- Telefon / WhatsApp: 0507 788 17 45
- Adres: Tevfik Bey Mah. Mektep Sk. No:19, Sefaköy, 34295 Küçükçekmece / İstanbul
