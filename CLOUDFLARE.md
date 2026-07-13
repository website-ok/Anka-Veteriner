# CLOUDFLARE.md — Cloudflare Pages + Decap CMS Kurulumu

Site statik; içerik `content.json` içindedir. Yönetim paneli `/admin` (Decap CMS),
düzenlemeyi GitHub'a commit'ler; Cloudflare Pages otomatik yeniden yayınlar.

İki bölüm var:
- **A. Lokalde görme** (hemen, hesap gerekmez) — müşteriye demo.
- **B. Canlıya alma** (Cloudflare + GitHub OAuth) — teslim için.

---

## A. Lokalde Decap'i görme (GitHub/OAuth gerekmez)

`admin/config.yml` içinde `local_backend: true` var. İki terminal:

```bash
# 1) Decap yerel backend (repoyu doğrudan düzenler) — proje kökünde:
npx decap-server

# 2) Statik sunucu (venv aktifken):
python Anka-Veteriner/scripts/serve.py
```

Tarayıcı: `http://localhost:8000/admin/` → giriş ekranı gelmez, doğrudan panel açılır
(local backend). Düzenle → **Publish** → `content.json` (ve varsa `img/`) **yerel dosyada**
güncellenir → `http://localhost:8000` yenilendiğinde değişiklik görünür.

> Not: Lokal modda Decap değişikliği doğrudan yerel dosyaya yazar; commit sizde kalır.

---

## B. Canlıya alma (teslim)

### 1. Repoyu Cloudflare Pages'e bağla
1. https://dash.cloudflare.com → **Workers & Pages > Create > Pages > Connect to Git**.
2. `website-ok/Anka-Veteriner` reposunu seç.
3. Build ayarları: **Framework preset: None**, **Build command: (boş)**,
   **Build output directory: `/`** (statik site, derleme yok).
4. **Save and Deploy** → `https://<proje>.pages.dev` adresi oluşur.

**Verify:** `.pages.dev` adresi siteyi açıyor.

### 2. GitHub OAuth App oluştur
1. GitHub → **Settings > Developer settings > OAuth Apps > New OAuth App**.
2. Homepage URL: `https://<proje>.pages.dev`
3. Authorization callback URL: `https://<oauth-worker>.workers.dev/callback`
   (Worker adresini 3. adımda alacaksın; sonra geri dönüp güncelle.)
4. **Client ID** ve **Client Secret**'i not al.

### 3. OAuth proxy Worker'ı deploy et
Decap'in GitHub backend'i, secret alışverişi için bir sunucu ister. Cloudflare Worker
tabanlı hazır bir OAuth provider kullan (Decap/Sveltia uyumlu). Özet:
1. Bir OAuth-provider Worker deposu klonla (ör. `sveltia-cms-auth` veya
   `decap-cms-github-oauth-provider` — ikisi de Decap ile çalışır).
2. `npx wrangler deploy` ile Cloudflare hesabına yükle.
3. Worker secret'larını ekle:
   ```bash
   npx wrangler secret put GITHUB_CLIENT_ID
   npx wrangler secret put GITHUB_CLIENT_SECRET
   ```
4. Worker adresini (`https://<oauth-worker>.workers.dev`) al ve:
   - GitHub OAuth App callback URL'sini `.../callback` olacak şekilde güncelle,
   - `admin/config.yml` içindeki `base_url`'ü bu Worker adresiyle değiştir, commit et.

**Verify:** `https://<proje>.pages.dev/admin/` → **Login with GitHub** → yetki ver →
panel açılır. Bir alan değiştir → **Publish** → GitHub'a commit gider → Pages yeniden
yayınlar → birkaç saniye sonra sitede görünür.

### 4. Müşteri erişimi
- Müşteriye repoda **collaborator** yetkisi ver (veya repoyu ona devret).
- Müşteri kendi GitHub hesabıyla `/admin/`'e girer.
- GitHub hesabı olmayan müşteri için: tek kullanımlık bir GitHub hesabı açıp
  bilgilerini teslim edebilirsin.

### 5. Domain (Metunic'ten sadece domain)
1. Metunic'ten alan adını al (ör. `ankaveteriner.com.tr`).
2. Cloudflare Pages → proje → **Custom domains > Set up a domain** → domaini gir.
3. Cloudflare verdiği DNS kayıtlarını Metunic panelinden ekle (ya da nameserver'ları
   Cloudflare'e çevir). SSL otomatik gelir.

**Verify:** `https://ankaveteriner.com.tr` siteyi açıyor, `/admin/` çalışıyor.

---

## Alternatif: Sveltia CMS
Decap ile aynı `config.yml`'i kullanır, arayüzü daha modern ve auth kurulumu biraz
daha basittir. Geçmek için tek değişiklik `admin/index.html`:
```html
<script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>
```
Diğer her şey (config.yml, akış) aynı kalır.

---

## Maliyet
Cloudflare Pages + Workers ücretsiz katmanı bu site için fazlasıyla yeterli.
Tek düzenli gider: domain (Metunic, yıllık).
