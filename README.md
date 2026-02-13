# Ertip Medikal v3.0 - Kurumsal Web Sitesi ve B2B Katalog

Bu proje, Ertip Medikal'in kurumsal web yüzünü ve ürün bilgi yönetimini (PIM) modernize etmek amacıyla geliştirilmiş tam yığın (full-stack) bir monorepo uygulamasıdır.

## 🏗 Mimari ve Teknoloji Yığını

Sistem, "Headless CMS" mantığını ortadan kaldırıp Frontend ve Backend'i aynı çatı altında birleştiren yeni nesil Next.js + Payload 3.0 mimarisi üzerine kurulmuştur.

- **Framework:** Next.js (App Router, Server Components, Server Actions)
- **İçerik Yönetim Sistemi (CMS):** Payload CMS v3.0 (Next.js Plugin)
- **Veritabanı:** PostgreSQL 16 (Yerel geliştirme için Docker Compose)
- **ORM:** Drizzle ORM
- **Stil ve Arayüz:** Tailwind CSS, Shadcn/UI, Lucide Icons
- **Zengin Metin Editörü:** Lexical (Payload üzerinden)

## 🗂 Klasör Yapısı (Route Groups)

Stil çakışmalarını önlemek ve performansı artırmak için proje iki izole alana bölünmüştür:
- `src/app/(website)`: Müşterilerin göreceği yüz. Kendi Tailwind ve Shadcn yapılandırmasını kullanır.
- `src/app/(payload)`: Yöneticilerin kullanacağı Payload CMS admin paneli. Kendi yerleşik tasarım sistemini kullanır.

## ✅ Tamamlanan Aşamalar (Şu Anki Durum)

### Faz 0: Çevre Hazırlığı ve Veritabanı
- [x] Next.js ve Payload için monorepo iskeletinin kurulması.
- [x] Docker Compose ile PostgreSQL 16 veritabanı entegrasyonu.
- [x] Paket versiyonlarının (React, Next, Payload) sabitlenip stabilize edilmesi.

### Faz 1: CMS ve Veri Mimarisi (Backend)
- [x] **Products:** Kategori ilişkileri, teknik özellikler tablosu, interaktif galeri ve PDF döküman destekli gelişmiş ürün şeması.
- [x] **Categories & Media:** Alt kategori desteği ve S3/Local optimize medya yönetimi.
- [x] **Pages (Page Builder):** Kod yazmadan sayfa oluşturabilmek için "Hero" ve "Content" blok mimarisi.
- [x] **Globals:** "Ana Menü" (MainMenu) ve "Site Ayarları" (SiteSettings) gibi tekil verilerin tanımlanması.
- [x] **Inquiries:** İletişim formundan gelen müşteri taleplerini toplayan veri şeması.

### Faz 2: Müşteri Arayüzü (Frontend)
- [x] Shadcn UI ve Tailwind CSS izolasyonunun sağlanması.
- [x] Dinamik üst menü (Header) ve Footer iskeletinin entegrasyonu.
- [x] Anasayfa ürün listeleme ve "Tüm Ürünler" (`/urunler`) katalog sayfası.
- [x] İnteraktif görsel galerisi, YouTube video oynatıcısı ve teknik özellik tablosuyla Ürün Detay (`/urunler/[slug]`) sayfası.
- [x] Page Builder üzerinden yaratılan kurumsal sayfaları (Hakkımızda vb.) çözümleyen Dinamik Yönlendirici (`/[slug]`).
- [x] Server Actions kullanılarak CMS'e güvenli veri yazan İletişim/Teklif Formu (`/iletisim`).

## 🚀 Yapılacaklar Listesi (Next Steps)

Projenin bir sonraki aşamasında eklenecek veya iyileştirilecek modüller şunlardır:

1. **Dinamik Footer Entegrasyonu:** Şu an statik olan Footer verilerini, CMS'teki `SiteSettings` global değişkenlerine bağlamak.
2. **Haberler ve Duyurular (`/haberler`):** CMS'teki "News" koleksiyonunu frontend'de listeleyecek blog mimarisini kurmak.
3. **SEO & Metadata:** Her ürün ve sayfa için dinamik title, description ve OpenGraph verileri üreten (generateMetadata) yapıyı kurmak. Sitenin Sitemap (site haritası) dosyasını otomatik oluşturmak.
4. **Filtreleme ve Sayfalama:** Ürün kataloğuna kategori bazlı filtreleme ve sayfalama (pagination) özelliği eklemek.
5. **Çoklu Dil (Opsiyonel):** Payload'un yerleşik i18n özelliğini kullanarak sisteme İngilizce desteği eklemek.

## 🛠 Geliştirici Ortamını Başlatma

Veritabanını ve sunucuyu ayağa kaldırmak için:

```bash
# 1. Veritabanını başlatın
docker-compose up -d

# 2. Bağımlılıkları yükleyin
pnpm install

# 3. Geliştirme sunucusunu başlatın
pnpm dev