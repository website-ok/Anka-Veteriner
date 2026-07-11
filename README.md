# Vet Anka Veteriner Kliniği — Web Sitesi

Sefaköy, Küçükçekmece'deki Vet Anka Veteriner Kliniği için tanıtım ve iletişim amaçlı,
mobil uyumlu statik web sitesi.

## Sayfalar

- `index.html` — Ana sayfa (tanıtım, öne çıkan hizmetler, yorumlar)
- `hizmetler.html` — Tüm hizmetlerin kategorili listesi
- `iletisim.html` — Adres, telefon, WhatsApp, harita ve yol tarifi

## Yerelde çalıştırma

Harici bağımlılık yoktur; sadece Python standart kütüphanesi kullanılır.

```bash
# venv aktifken, proje kökünden:
python Anka-Veteriner/scripts/serve.py
```

Ardından tarayıcıda `http://localhost:8000` adresini açın.

## Teknik

- Saf HTML + CSS + JavaScript (framework yok)
- Google Fonts (Poppins, Inter)
- Mobil menü ve kaydırma animasyonları için küçük bir `js/site.js`
- Google Maps embed ile konum

## İletişim

- Telefon / WhatsApp: 0507 788 17 45
- Adres: Tevfik Bey Mah. Mektep Sk. No:19, Sefaköy, 34295 Küçükçekmece / İstanbul
