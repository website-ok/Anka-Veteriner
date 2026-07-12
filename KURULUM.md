# Firebase Kurulumu (Tek Seferlik — ~10 dakika)

Yönetim panelinin **"Kaydet → anında canlı"** çalışması için ücretsiz bir Firebase
projesi gerekir. Bu adımları bir kez yapın; teslimden sonra müşteri sadece panele
girip düzenler, sizin bir işiniz kalmaz.

---

## 1. Proje oluştur
1. https://console.firebase.google.com adresine Google hesabıyla girin.
2. **Proje ekle** → isim verin (ör. `anka-veteriner`) → oluşturun.
   (Google Analytics'i kapatabilirsiniz, gerekmez.)

## 2. Firestore veritabanını aç
1. Sol menü → **Build > Firestore Database** → **Veritabanı oluştur**.
2. **Production mode** seçin → konum olarak `eur3 (europe-west)` → **Etkinleştir**.

## 3. Güvenlik kurallarını ayarla
1. Firestore ekranında **Rules (Kurallar)** sekmesine geçin.
2. İçeriği silip bu depodaki [`firestore.rules`](firestore.rules) dosyasının
   içeriğiyle değiştirin → **Publish (Yayınla)**.
   (Herkes okuyabilir, sadece giriş yapan yönetici yazabilir.)

## 4. Girişi (Authentication) aç
1. Sol menü → **Build > Authentication** → **Get started**.
2. **Sign-in method** → **Email/Password** → **Enable** → kaydet.
3. **Users** sekmesi → **Add user** → müşterinin e-postası + bir şifre girin.
   > Bu e-posta/şifre, müşterinin panele giriş bilgisidir. Müşteriye bunu verin;
   > şifreyi panelde değil, buradan (Authentication > Users) değiştirebilirsiniz.

## 5. Web uygulaması ayarlarını al
1. Sol üst **⚙️ (dişli) > Proje ayarları**.
2. Aşağıda **Uygulamalarınız** → web simgesine (`</>`) tıklayın.
3. Bir takma ad verip **Uygulamayı kaydet**.
4. Ekranda çıkan `firebaseConfig` değerlerini kopyalayın.

## 6. Ayarları projeye yapıştır
1. [`js/firebase-config.js`](js/firebase-config.js) dosyasını açın.
2. `BURAYA...` yazan alanları kopyaladığınız değerlerle değiştirin.
3. Kaydedin, commit + push yapın.

---

## Bitti 🎉
- Site adresiniz + `/admin.html` → müşteri e-posta/şifre ile girer.
- Düzenler, **Kaydet**'e basar → değişiklik **tüm ziyaretçilerde anında** görünür.
- Sizin teslimden sonra hiçbir işlem yapmanıza gerek yoktur.

## Notlar
- **Görseller:** Panelden "Dosya seç" ile eklenen görseller doğrudan veritabanına
  gömülür. Firestore belge sınırı **1 MB** olduğundan, çok sayıda/büyük görseli
  gömmek yerine görselleri `img/` klasörüne koyup yolunu yazmak (ör. `img/kedi.jpg`)
  ya da bir görsel bağlantısı yapıştırmak daha sağlıklıdır. **Videolar** yalnızca
  bağlantı (URL) veya YouTube linki ile eklenir.
- **Ücret:** Firebase ücretsiz (Spark) planı bu kullanım için fazlasıyla yeterlidir.
- Firebase kurulmadan önce site, `content.json` içindeki varsayılan içerikle sorunsuz
  çalışmaya devam eder; yalnızca panelden canlı kayıt yapılamaz.
