# Ertip Medikal v3.0 - Kurumsal Web Sitesi ve B2B Katalog

Bu proje, Ertip Medikal'in kurumsal web yüzünü, ürün bilgi yönetimini (PIM) ve B2B Teklif Toplama (RFQ) sistemini modernize etmek amacıyla geliştirilmiş tam yığın (full-stack) bir monorepo uygulamasıdır.

## 🏗 Mimari ve Teknoloji Yığını

Sistem, "Headless CMS" mantığını ortadan kaldırıp Frontend ve Backend'i aynı çatı altında birleştiren yeni nesil Next.js + Payload 3.0 mimarisi üzerine kurulmuştur.

- **Framework:** Next.js 15 (App Router, Server Components, Bölünmüş İstemci/Sunucu Mimarisi)
- **İçerik Yönetim Sistemi (CMS):** Payload CMS v3.0 (Next.js Plugin)
- **Veritabanı:** PostgreSQL 16 (Yerel geliştirme için Docker Compose)
- **ORM:** Drizzle ORM
- **Stil ve Arayüz:** Tailwind CSS, Shadcn/UI, Lucide Icons, Framer Motion
- **Zengin Metin & Tipografi:** md-editor-rt (Admin), react-markdown, @tailwindcss/typography (Frontend)
- **Global State:** Context API (CartProvider)

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
- [x] **Akıllı Alanlar:** Otomatik URL üreten `slugField` ve merkezi `metaFields` (SEO) altyapısı.
- [x] **News & Categories:** Kategori filtrelemeli Haber/Etkinlik modülü.
- [x] **Premium Page Builder:** 14+ dinamik blok mimarisi (HeroSlider, Features, Process, vb.).
- [x] **Gelişmiş PIM (Products):** Medikal cihazlara özel dinamik teknik özellikler (Specs), Lojistik boyutları, Ambalajlama seçenekleri ve esnek yerleşim (Sidebar/Aşağı) modülleri.
- [x] **Akıllı SKU Motoru:** Varyant (Çap/Uzunluk) kombinasyonlarını hesaplayıp otomatik medikal SKU barkodları üreten hook mimarisi.

### Faz 2: Müşteri Arayüzü ve Teknik SEO (Frontend)
- [x] **%100 Dinamik Anasayfa & Akıllı Footer:** CMS üzerinden modüler yönetim.
- [x] **Tasarım & Tipografi:** Shadcn UI, Tailwind Typography eklentisi ile kusursuz Markdown render ve profesyonel dokümantasyon görünümü (Pill etiketleri, Tablolar).
- [x] **Teknik SEO:** "Akıllı Fallback" dinamik `generateMetadata` ve `sitemap.xml` üretici entegrasyonu.

### Faz 3: B2B E-Ticaret ve Teklif Sistemi (RFQ)
- [x] **Karanlık Mod Destekli Editör:** Admin panelinde canlı önizlemeli (Split-View) özel Markdown Editör entegrasyonu.
- [x] **Global Sepet Yönetimi:** Context API tabanlı, miktar güncellemelerini ve aynı SKU çakışmalarını yöneten `CartProvider`.
- [x] **Mikro Etkileşimler:** Framer Motion ile tasarlanmış, sepet bildirimlerini ekrana kaydırarak getiren Toast sistemi ve dinamik Header rozeti.
- [x] **Teklif İsteme Formu:** Seçilen varyantların ve miktarların tek ekranda toplanıp, iletişim bilgileriyle birlikte doğrudan CMS'teki "Teklif Talepleri" (CRM) havuzuna aktarıldığı B2B sepet yapısı.

## 🚀 Yapılacaklar Listesi (Next Steps)

Projenin bir sonraki aşamasında eklenecek özellikler şunlardır:

1. **Çoklu Dil (i18n) Desteği:** Özellikle hedef pazarlar olan Orta Doğu ve Avrupa için İngilizce ve Arapça dil seçeneklerinin (Payload Localized Fields ile) entegre edilmesi.
2. **Katalog Filtreleri & Gelişmiş Arama:** Ürünler ana sayfasında kategori/özellik bazlı tıkla-filtrele yapısının kurulması ve Header arama çubuğunun işlevselleştirilmesi.
3. **Talep Bildirim API'si (Nodemailer/Resend):** Yeni bir teklif talebi geldiğinde adminlere ve müşteriye otomatik konfirmasyon maili gönderen altyapının kurulması.
4. **DevOps (Canlıya Alma):** Vercel veya DigitalOcean VPS üzerinden CI/CD pipeline kurulumu ve production ortamına deploy süreçlerinin başlatılması.

## 🛠 Geliştirici Ortamını Başlatma

```bash
docker-compose up -d
pnpm install
pnpm dev