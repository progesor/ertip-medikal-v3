# Ertip Medikal v3.0 - Kurumsal Web Sitesi ve B2B Katalog

Bu proje, Ertip Medikal'in kurumsal web yüzünü, ürün bilgi yönetimini (PIM) ve B2B Teklif Toplama (RFQ) sistemini modernize etmek amacıyla geliştirilmiş tam yığın (full-stack) bir monorepo uygulamasıdır. Standart bir web sitesinden ziyade, Tıbbi Cihaz Tüzüğü (MDR) standartlarına uyumlu çalışan bir medikal portaldır.

## 🏗 Mimari ve Teknoloji Yığını

Sistem, "Headless CMS" mantığını ortadan kaldırıp Frontend ve Backend'i aynı çatı altında birleştiren yeni nesil Next.js + Payload 3.0 mimarisi üzerine kurulmuştur.

- **Framework:** Next.js 15 (App Router, Server Components, Bölünmüş İstemci/Sunucu Mimarisi)
- **İçerik Yönetim Sistemi (CMS):** Payload CMS v3.0 (Next.js Plugin)
- **Veritabanı:** PostgreSQL 16 (Yerel geliştirme için Docker Compose)
- **ORM:** Drizzle ORM
- **Stil ve Arayüz:** Tailwind CSS, Shadcn/UI, Lucide Icons, Framer Motion
- **Zengin Metin & Tipografi:** md-editor-rt (Admin tarafı Markdown), react-markdown, @tailwindcss/typography (Frontend)
- **Global State:** Context API (CartProvider)

## 🗂 Klasör Yapısı (Route Groups)

Stil çakışmalarını önlemek ve performansı artırmak için proje iki izole alana bölünmüştür:
- `src/app/(website)`: Müşterilerin göreceği yüz. Kendi Tailwind ve Shadcn yapılandırmasını kullanır.
- `src/app/(payload)`: Yöneticilerin kullanacağı Payload CMS admin paneli. Akıllı URL'ler, Sekmeli Yapı ve Merkezi SEO blokları ile özelleştirilmiştir.

---

## ✅ Tamamlanan Aşamalar ve Geliştirme Fazları

### Faz 0: Proje İskeleti ve Veritabanı Hazırlığı
- [x] Next.js 15 ve Payload 3.0 monorepo iskeletinin kurulması ve versiyon sabitlemesi.
- [x] Docker Compose ile PostgreSQL 16 veritabanı entegrasyonu ve Drizzle ORM bağlantıları.
- [x] Turbopack ve React Context çakışmalarının giderilerek stabil geliştirme ortamının sağlanması.

### Faz 1: CMS ve Zeki Veri Mimarisi (Backend)
- [x] **Akıllı Alanlar & Bloklar:** Otomatik URL üreten `slugField`, merkezi `metaFields` (SEO) altyapısı ve 14+ dinamik blok barındıran Page Builder (Sayfa Oluşturucu) mimarisi.
- [x] **Gelişmiş PIM (Products):** Medikal cihazlara özel dinamik teknik özellikler (Specs), Lojistik boyutları (G-Y-D, Ağırlık), çoklu ambalajlama (Packaging) seçenekleri ve esnek yerleşim modülleri (Sidebar/Wide).
- [x] **Akıllı SKU Motoru:** Varyant (Çap/Uzunluk vb.) kombinasyonlarını (Kartezyen çarpım) otomatik hesaplayıp medikal SKU barkodları üreten hook mimarisi.
- [x] **Dinamik Vitrin Motoru:** Admin panelindeki `isFeatured` (Öne Çıkar) işaretine göre anasayfada ürünleri otomatik derleyen ve listeleyen akıllı blok yapısı (`FeaturedProductsBlock`).
- [x] **Karanlık Mod Destekli Editör:** Payload'un standart Lexical editörü yerine, anlık önizlemeli (Split-View) özel Markdown Editör (`md-editor-rt`) entegrasyonu.

### Faz 2: Müşteri Arayüzü ve Akıllı Katalog (Frontend)
- [x] **Merkezi & Derin Arama (Deep Search):** Sadece ana ürün başlıklarında değil, iç içe geçmiş dizilerdeki (array) varyant SKU'larında da arama yapabilen, aktif "Filtre Çipleri" (Chips) barındıran gelişmiş arama motoru.
- [x] **Sayfalama (Pagination):** Performansı koruyan, URL arama parametreleri ile senkronize Next.js 15 tabanlı sayfalama sistemi.
- [x] **Bağlamsal Navigasyon:** Ürün detay sayfalarında Google SEO dostu "Breadcrumb" (Ekmek kırıntısı) yapısı ve CMS'ten otomatik veya manuel çekilen "İlişkili Ürünler" vitrini.
- [x] **Tasarım & Tipografi:** Shadcn UI ve Tailwind Typography eklentisi ile kusursuz Markdown render, teknik dokümantasyon görünümü (Pill etiketleri, detaylı tablolar).

### Faz 3: B2B E-Ticaret ve Teklif Sistemi (RFQ)
- [x] **Global Sepet Yönetimi:** Context API tabanlı, `localStorage` senkronizasyonlu, miktar güncellemelerini (+/-) ve mükerrer SKU çakışmalarını hatasız yöneten `CartProvider`.
- [x] **Mikro Etkileşimler:** Framer Motion ile tasarlanmış, sepet bildirimlerini ekrana pürüzsüz kaydırarak getiren Toast sistemi ve anlık güncellenen Header sepet rozeti.
- [x] **B2B Teklif İsteme Formu:** Seçilen varyantların ve miktarların tek ekranda toplanıp, form verileriyle birlikte doğrudan CMS'teki "Teklif Talepleri" (QuoteRequests) havuzuna aktarıldığı B2B RFQ altyapısı.

### Faz 4: MDR Uyumlu Dokümantasyon ve Güvenlik (Medikal Portal)
- [x] **Güvenli Doküman Yönetimi:** Ürün sayfalarında halka açık broşürler ile yalnızca seri numarası/kod ile erişilebilen şifreli teknik kılavuzların ayrıştırılması.
- [x] **Kayıt ve İzlenebilirlik (Loglama):** Tıbbi Cihaz Tüzüğü (MDR) standartlarına uygun olarak; kilitli belgelere erişen kullanıcıların IP, Lokasyon ve User-Agent verilerinin Payload üzerindeki `DownloadLogs` tablosunda tutulması.
- [x] **Uygulama İçi (In-App) PDF Görüntüleyici:** Tarayıcıların popup engelleyicilerine (ad-blocker) takılmayan, indirme ipucu (Hint) barındıran şık ve güvenli doküman görüntüleme modalı.
- [x] **Otomatik QR Doğrulama:** Ürün etiketlerindeki QR kod okutulduğunda (`?tab=docs&code=...`), kullanıcının şifre girmesine gerek kalmadan arkaplanda (`/api/verify-manual`) doğrulama yapıp doğrudan kılavuzu açan otonom yapı.

---

## 🚀 Yapılacaklar Listesi (Next Steps)

Projenin bir sonraki aşamasında eklenecek özellikler şunlardır:

1. **Genel Sertifikalar Sayfası:** Şirketin ISO, CE vb. kalite sertifikalarının sergileneceği bağımsız kurumsal sayfa.
2. **Talep Bildirim API'si (Nodemailer/Resend):** Yeni bir teklif talebi geldiğinde yöneticilere ve müşteriye otomatik konfirmasyon maili gönderen altyapının kurulması.
3. **Çoklu Dil (i18n) Desteği:** Özellikle hedef pazarlar olan Avrupa ve Asya için İngilizce ve diğer dil seçeneklerinin (Payload Localized Fields ile) entegre edilmesi.
4. **DevOps (Canlıya Alma):** VPS üzerinden CI/CD pipeline kurulumu ve production ortamına deploy süreçlerinin başlatılması.

## 🛠 Geliştirici Ortamını Başlatma

Yerel geliştirme ortamını kurmak için aşağıdaki adımları izleyin:

```bash
docker-compose up -d
pnpm install
pnpm dev