# Ertip Medikal v3.0 - Kurumsal Web Sitesi ve B2B Katalog

Bu proje, Ertip Medikal'in kurumsal web yüzünü ve ürün bilgi yönetimini (PIM) modernize etmek amacıyla geliştirilmiş tam yığın (full-stack) bir monorepo uygulamasıdır.

## 🏗 Mimari ve Teknoloji Yığını

Sistem, "Headless CMS" mantığını ortadan kaldırıp Frontend ve Backend'i aynı çatı altında birleştiren yeni nesil Next.js + Payload 3.0 mimarisi üzerine kurulmuştur.

- **Framework:** Next.js 15 (App Router, Server Components)
- **İçerik Yönetim Sistemi (CMS):** Payload CMS v3.0 (Next.js Plugin)
- **Veritabanı:** PostgreSQL 16 (Yerel geliştirme için Docker Compose)
- **ORM:** Drizzle ORM
- **Stil ve Arayüz:** Tailwind CSS, Shadcn/UI, Lucide Icons
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
- [x] **Pages (Page Builder):** Kod yazmadan sayfa oluşturabilmek için "Hero" ve "Content" blok mimarisi.
- [x] **Globals:** Ana Menü, Site Ayarları (İletişim, Sosyal Medya vb.) tanımları.

### Faz 2: Müşteri Arayüzü ve Teknik SEO (Frontend)
- [x] **Tasarım:** Shadcn UI ve Tailwind CSS izolasyonunun sağlanması.
- [x] **Katalog:** Ürün listeleme (`/urunler`) ve zengin içerikli Ürün Detay (`/urunler/[slug]`) sayfaları.
- [x] **Blog/Haberler:** URL searchParams destekli, kategori filtrelemeli Haberler ana sayfası ve sinematik detay sayfası.
- [x] **Kurumsal:** CMS SiteSettings üzerinden beslenen Dinamik Footer ve iletişim formu (`/iletisim`).
- [x] **Teknik SEO:** "Akıllı Fallback" mantığıyla çalışan dinamik `generateMetadata` entegrasyonu ve OpenGraph ayarları.
- [x] **Sitemap:** Otomatik `sitemap.xml` üretici entegrasyonu.

## 🚀 Yapılacaklar Listesi (Next Steps)

Projenin bir sonraki aşamasında eklenecek veya iyileştirilecek modüller şunlardır:

1. **Dinamik Anasayfa (`page.tsx`):** Mevcut statik anasayfanın Payload CMS `Pages` koleksiyonuna veya özel bir Globals'e bağlanması.
2. **Gelişmiş Page Builder Blokları:** Kurumsal sayfalar için admin panelinden sürüklenebilir Resim Galerisi Bloğu (`ImageGalleryBlock`), İletişim Formu Bloğu veya İkonlu Özellikler Bloğu tasarlanması.
3. **Katalog Filtreleri:** Ürünler ana sayfasında (`/urunler`) kategori bazlı tıkla-filtrele yapısının kurulması.
4. **DevOps (Canlıya Alma):** DigitalOcean veya Vercel üzerinden production deploy süreçlerinin başlatılması.

## 🛠 Geliştirici Ortamını Başlatma

```bash
docker-compose up -d
pnpm install
pnpm dev