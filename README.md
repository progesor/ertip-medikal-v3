# Ertip Medikal v3.0 - Kurumsal Web Sitesi ve B2B Katalog

Bu proje, Ertip Medikal'in kurumsal web yüzünü ve ürün bilgi yönetimini (PIM) modernize etmek amacıyla geliştirilmiş tam yığın (full-stack) bir monorepo uygulamasıdır.

## 🏗 Mimari ve Teknoloji Yığını

Sistem, "Headless CMS" mantığını ortadan kaldırıp Frontend ve Backend'i aynı çatı altında birleştiren yeni nesil Next.js + Payload 3.0 mimarisi üzerine kurulmuştur.

- **Framework:** Next.js 15 (App Router, Server Components)
- **İçerik Yönetim Sistemi (CMS):** Payload CMS v3.0 (Next.js Plugin)
- **Veritabanı:** PostgreSQL 16 (Yerel geliştirme için Docker Compose)
- **ORM:** Drizzle ORM
- **Stil ve Arayüz:** Tailwind CSS, Shadcn/UI, Lucide Icons, Framer Motion
- **Zengin Metin Editörü:** Lexical (Payload üzerinden)

## 🗂 Klasör Yapısı (Route Groups)

Stil çakışmalarını önlemek ve performansı artırmak için proje iki izole alana bölünmüştür:
- `src/app/(website)`: Müşterilerin göreceği yüz. Kendi Tailwind ve Shadcn yapılandırmasını kullanır.
- `src/app/(payload)`: Yöneticilerin kullanacağı Payload CMS admin paneli. Akıllı URL'ler, Sekmeli Yapı ve Merkezi SEO blokları ile özelleştirilmiştir.

## ✅ Tamamlanan Aşamalar (Şu Anki Durum)

### Faz 0: Çevre Hazırlığı ve Veritabanı
- [x] Next.js ve Payload monorepo iskeletinin kurulması ve versiyon sabitlemesi.
- [x] Docker Compose ile PostgreSQL 16 veritabanı entegrasyonu.
- [x] Turbopack ve React Context çakışmalarının giderilmesi.

### Faz 1: CMS ve Zeki Veri Mimarisi (Backend)
- [x] **Akıllı Alanlar:** Otomatik URL üreten `slugField` ve merkezi `metaFields` (SEO) altyapısının kurulması.
- [x] **Products:** Kategori ilişkileri, spesifikasyonlar, galeri ve doküman destekli "Sekmeli (Tabs)" şema.
- [x] **News & Categories:** Kategori filtrelemeli, galerili ve zengin metin destekli Haber/Etkinlik modülü.
- [x] **Premium Page Builder:** Kod yazmadan sayfa oluşturabilmek için 14+ dinamik blok mimarisi (HeroSlider, Features, Process, Certificates, Testimonials, CTA, LogoSlider vb.).
- [x] **Globals:** Ana Menü, Site Ayarları (Logo Yönetimi, Dinamik Bloklu Footer, İletişim, Sosyal Medya).

### Faz 2: Müşteri Arayüzü ve Teknik SEO (Frontend)
- [x] **%100 Dinamik Anasayfa:** CMS üzerinden yönetilen (`home` slug), modüler ve blok tabanlı dinamik anasayfa motoru.
- [x] **Akıllı Footer:** Sütun sayısı (1-4) değişebilen, menü/metin/iletişim bloklarını destekleyen ve alt yasal barı içeren tam dinamik footer.
- [x] **Tasarım:** Shadcn UI ve Tailwind CSS izolasyonunun sağlanması, Lightbox ve Carousel entegrasyonları.
- [x] **Katalog & Blog:** Ürün ve Haber listeleme/detay sayfalarının zengin içerikli şekilde kodlanması.
- [x] **Teknik SEO:** "Akıllı Fallback" mantığıyla çalışan dinamik `generateMetadata` entegrasyonu ve OpenGraph ayarları.
- [x] **Sitemap:** Otomatik `sitemap.xml` üretici entegrasyonu.

## 🚀 Yapılacaklar Listesi (Next Steps)

Projenin bir sonraki aşamasında eklenecek Premium özellikler ve modüller şunlardır:

1. **Çoklu Dil (i18n) Desteği:** Özellikle hedef pazarlar olan Orta Doğu ve Avrupa için İngilizce ve Arapça dil seçeneklerinin (Payload Localized Fields ile) entegre edilmesi.
2. **Katalog Filtreleri & Gelişmiş Arama:** Ürünler ana sayfasında kategori/özellik bazlı tıkla-filtrele yapısının kurulması ve site geneli (Haber/Ürün) çalışan akıllı arama motoru.
3. **Bülten (Newsletter) API Entegrasyonu:** `NewsletterBlock` üzerinden gelen e-posta kayıtlarının Mailchimp, Resend veya benzeri bir CRM platformuna otomatik aktarılması.
4. **B2B Bayi Portalı (Opsiyonel):** Kliniktler ve doktorlar için özel fiyatların ve dokümanların (kullanım kılavuzları vb.) yer aldığı şifreli bayi giriş modülü.
5. **Animasyon ve Mikro Etkileşimler:** Mevcut Page Builder bloklarına Framer Motion ile scroll tabanlı (scroll-reveal) profesyonel animasyonların eklenmesi.
6. **DevOps (Canlıya Alma):** Vercel veya DigitalOcean VPS üzerinden CI/CD pipeline kurulumu ve production ortamına deploy süreçlerinin başlatılması.

## 🛠 Geliştirici Ortamını Başlatma

```bash
docker-compose up -d
pnpm install
pnpm dev