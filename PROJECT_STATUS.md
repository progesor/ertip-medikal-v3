# Ertip Medikal v3 - Proje Durumu

Bu dosya, tamamlanan fazları ve önerilen sonraki işleri kısa şekilde takip etmek için tutulur.

## Tamamlanan Ana Fazlar

- Next.js + Payload CMS monorepo kurulumu.
- Payload koleksiyonları: ürün, kategori, sayfa, haber, talepler, teklif talepleri, download log, aboneler.
- Payload globals: Site Settings, Main Menu, Email Settings, Theme Settings.
- CMS Page Builder altyapısı.
- Ürün/PIM sistemi ve varyant/SKU üretim hook’u.
- Ürün katalog ve ürün detay sayfaları.
- Ürün galerisi: thumbnail, previous/next, fullscreen, keyboard navigation.
- Public/protected product documents.
- `/api/verify-manual` erişim kodu doğrulama.
- Download loglama.
- RFQ teklif sepeti ve `quote-requests` entegrasyonu.
- Tema/token refactor ve çoklu medikal palet.
- Dynamic header settings.
- `symbolLogo` desteği.
- Floating contact button settings.
- Admin `ThemePreview`.
- Markdown editor entegrasyonu.
- Esnek CMS blok layoutları:
  - Features
  - Testimonial
  - Team
  - Gallery
  - Location
  - Stats

## Son Eklenen/Güncellenen Alanlar

- `SiteSettings.general.symbolLogo`
- `SiteSettings.header.*`
- `SiteSettings.floatingAction.*`
- `FeaturesBlock.layoutMode`
- `FeaturesBlock.alignment`
- `TestimonialBlock.layoutMode`
- `TeamBlock.layoutMode`
- `GalleryBlock.galleryLayout`
- `LocationBlock.layoutMode`

## Bekleyen Önerilen Batches

1. Next config uyarısı:
   - `experimental.reactCompiler` top-level `reactCompiler` alanına taşınmalı veya güncel Next/Payload uyumluluğuna göre yeniden değerlendirilmeli.

2. Mobil header:
   - Hamburger menü ihtiyacı kontrol edilmeli.
   - Header logo + company text + CTA kombinasyonları mobilde test edilmeli.

3. Ek CMS layout esnekliği:
   - `FeaturedProductsBlock`
   - `ProcessBlock`
   - `LogoSliderBlock`
   - `CertificateGridBlock`
   - `NewsGridClient`
   - `FAQBlock`

4. Test kapsamı:
   - Ürün varyant sepete ekleme.
   - Teklif talebi oluşturma.
   - Korumalı doküman kod doğrulama.
   - Download log oluşturma.
   - ThemeSettings palette/radius değişimi.
   - FloatingActionButton türleri.

5. İçerik/SEO:
   - Sitemap çıktısı kontrol edilmeli.
   - Meta alanları gerçek içerikle doğrulanmalı.
   - Haber ve ürün OG görselleri test edilmeli.

## Manuel QA Checklist

- `/`
- `/urunler`
- `/urunler/[slug]`
- `/teklif-sepeti`
- `/haberler/[slug]`
- `/abonelikten-ayril`
- Dinamik `/[slug]` CMS sayfaları
- Payload Admin:
  - Site Settings
  - Theme Settings
  - Pages Page Builder
  - Products
  - Quote Requests
  - Download Logs

## Bilinen Uyarılar

- Build sırasında Next.js 16, `experimental.reactCompiler` için uyarı veriyor.
- Repo Windows/WSL ortamında CRLF/LF normalizasyon uyarıları üretebilir.
