# Ertip Medikal v3 - AI/Developer Context

Bu doküman, projeyi yeni bir geliştiriciye veya AI asistana hızlıca anlatmak için hazırlanmıştır.

## Kısa Özet

Ertip Medikal v3, Next.js 16 + Payload CMS 3 tabanlı kurumsal medikal web sitesi ve B2B ürün/RFQ portalıdır. Ürün/PIM yönetimi, teklif sepeti, korumalı doküman doğrulama, CMS Page Builder, tema sistemi, dinamik header/footer ve hızlı iletişim butonu içerir.

## Mimari

- App Router kullanılır.
- Payload ve website route grupları ayrıdır.
- Dinamik CMS sayfaları `src/app/(website)/[slug]/page.tsx` içinden `pages.layout` bloklarıyla render edilir.
- `/urunler` ve `/teklif-sepeti` kilitli statik uygulama rotalarıdır; CMS sayfasına çevrilmemelidir.

## Önemli Dosyalar

- `src/payload.config.ts`: Payload koleksiyon/global kayıtları.
- `src/collections/*`: Payload koleksiyonları.
- `src/globals/*`: Site, tema, menü, e-posta global ayarları.
- `src/blocks/*`: Page Builder blok şemaları.
- `src/components/blocks/*`: Blok frontend render bileşenleri.
- `src/lib/themeConfig.ts`: Tema paletleri ve radius presetleri.
- `src/styles/globals.css`: Varsayılan CSS değişkenleri ve Tailwind base.
- `src/components/layout/Header.tsx`: CMS kontrollü header.
- `src/components/layout/FloatingActionButton.tsx`: CMS kontrollü hızlı iletişim butonu.
- `src/providers/CartProvider.tsx`: Teklif sepeti state yönetimi.
- `src/components/product/ProductView.tsx`: Ürün detay arayüzü.
- `src/components/product/ProductGallery.tsx`: Thumbnail, navigation, fullscreen ve klavye destekli ürün galerisi.

## Ana Rotalar

- `/`: CMS ana sayfa.
- `/[slug]`: CMS sayfaları.
- `/urunler`: Ürün katalog/listing.
- `/urunler/[slug]`: Ürün detay.
- `/teklif-sepeti`: RFQ teklif sepeti.
- `/haberler/[slug]`: Haber detay.
- `/abonelikten-ayril`: Bülten abonelikten çıkma.
- `/admin/[[...segments]]`: Payload admin.
- `/api/[...slug]`: Payload REST.
- `/graphql`: Payload GraphQL.
- `/api/verify-manual`: Korumalı doküman erişim doğrulama.
- `/sitemap.xml`: Sitemap.

## Koleksiyonlar

- `users`
- `media`
- `products`
- `categories`
- `pages`
- `news`
- `news-categories`
- `inquiries`
- `quote-requests`
- `download-logs`
- `subscribers`

## Global Ayarlar

- `site-settings`: logo, `symbolLogo`, header, contact, floating action, social media, footer.
- `main-menu`: Header navigasyonu.
- `emailSettings`: İletişim/teklif bildirim alıcıları.
- `themeSettings`: Renk paleti, radius ve admin `ThemePreview`.

## Tema Sistemi

Tema sistemi `src/lib/themeConfig.ts`, `src/styles/globals.css`, Tailwind tokenları ve `ThemeSettings` globaliyle çalışır.

Paletler:

- `dark-luxury`
- `medical-blue`
- `medical-aqua`
- `ocean`
- `emerald`
- `clinical-mint`
- `premium-navy`
- `surgical-teal`
- `ruby`

Önemli tokenlar:

- `primary`, `primary-foreground`
- `background`, `foreground`
- `surface`, `surface-muted`, `surface-inverse`, `surface-inverse-foreground`
- `text-main`, `text-muted`
- `success`, `error`, `warning`, `info`, `destructive`
- `border`, `input`, `ring`
- `--radius`, `--radius-xl`, `--radius-2xl`, `--radius-3xl`

Kural: Yeni UI eklerken hardcoded renk/radius yerine tema tokenları kullanılmalı.

## Site Settings Özeti

Genel logo:

- `siteLogo`
- `whiteLogo`
- `symbolLogo`

Header:

- `showLogoInHeader`
- `headerLogoVariant`: `auto | default | white | symbol`
- `showCompanyNameInHeader`
- `showTaglineInHeader`
- `headerCompanyName`
- `headerTagline`
- `headerLayout`: `default | compact | brand`
- `headerCtaLabel`
- `headerCtaHref`

Floating action:

- `enabled`
- `type`: `whatsapp | phone | email | custom`
- `position`: `bottom-right | bottom-left`
- `label`
- `openInNewTab`
- `styleMode`: `theme | whatsapp`
- `appearance`: `pill | chat-bubble | icon-only`
- `showIcon`
- `showPulse`
- `showHelperText`
- `helperText`
- `phoneNumber`, `message`, `email`, `customUrl`

Ürün kataloğu:

- `SiteSettings.productCatalog.defaultSortMode`: `newest | oldest | manual`
- `SiteSettings.productCatalog.manualProductOrder`
- Kategori override alanları:
  - `Category.productSortMode`: `inherit | newest | oldest | manual`
  - `Category.manualProductOrder`
- Manuel listede olmayan ürünler, manuel ürünlerin ardından yeni ürün önce
  sırasıyla gösterilir.

## CMS Blokları

Page Builder blokları:

- `HeroBlock`
- `HeroSliderBlock`
- `ContentBlock`
- `FeaturesBlock`
- `FeaturedProductsBlock`
- `FAQBlock`
- `TestimonialBlock`
- `StatsBlock`
- `GalleryBlock`
- `LogoSliderBlock`
- `LocationBlock`
- `TeamBlock`
- `NewsletterBlock`
- `CertificateGridBlock`
- `ProcessBlock`
- `CTABlock`
- `ContactFormBlock`
- `NewsFeedBlock`

Esnek layout eklenen bloklar:

- `FeaturesBlock`: `layoutMode`, `alignment`
- `TestimonialBlock`: `layoutMode`
- `TeamBlock`: `layoutMode`
- `GalleryBlock`: `galleryLayout`
- `LocationBlock`: `layoutMode`
- `StatsBlock`: item count bazlı otomatik grid

## Ürün/PIM Sistemi

`products` koleksiyonu:

- Ürün başlık, kısa açıklama, Markdown/HTML açıklama.
- Teknik özellikler.
- Ana görsel, galeri, video URL.
- Attribute bazlı varyant/SKU üretimi.
- Her varyant için opsiyonel `variantImages`.
- `inheritVariantImagesFromPrevious` açıkken görselsiz varyant, listede en yakın
  önceki görselli varyantın görsellerini devralır. Yeni görselli varyant yeni
  grubu başlatır.
- İlk varyant ürün sayfası açıldığında otomatik seçilir.
- Varyant görselleri galeride önce, ortak `gallery` görselleri ardından gösterilir.
- `hideMainImageWhenVariantSelected` varsayılan açıkken varyant görseli mevcutsa
  `mainImage` gizlenir; ürün bazında kapatılabilir.
- Lojistik ölçüler ve paketleme.
- Public/protected dokümanlar.
- `accessCodes` ile korumalı doküman erişimi.
- `isFeatured`, `isOriginalErtipProduct`.
- Kategoriler, ilgili ürünler, SEO.

## RFQ / Quote Cart

- `CartProvider` localStorage tabanlı sepet yönetir.
- Ürün varyantları sepete eklenir.
- `/teklif-sepeti` müşteri bilgileriyle `quote-requests` kaydı oluşturur.
- `QuoteRequests` create hook’u, `emailSettings.quoteReceivers` varsa e-posta gönderir.

## Korumalı Doküman Sistemi

- Public docs doğrudan gösterilir.
- Protected docs erişim kodu ister.
- API: `src/app/api/verify-manual/route.ts`
- Log koleksiyonu: `download-logs`
- Ürün detayında QR/URL parametreli otomatik doğrulama desteği vardır.

## Admin Araçları

- `MarkdownEditor`: Ürün açıklamaları için özel Markdown editör.
- `ThemePreview`: Tema/radius canlı önizleme.

## Bilinen Uyarılar

- `next.config.mjs` içinde `experimental.reactCompiler` kullanılıyor. Next.js 16 build uyarısı, bunun top-level `reactCompiler` alanına taşınmasını öneriyor.
- `git diff --check` CRLF normalizasyon uyarıları gösterebilir; içerik hatası değildir.
- Mobil header/hamburger davranışı ayrıca görsel QA gerektirir.

## Son Büyük İyileştirmeler

- Tema/token refactor.
- State/inverse tokenları.
- Gelişmiş `ThemePreview`.
- Dinamik header ve `symbolLogo`.
- Floating contact button.
- Ürün galerisi fullscreen/keyboard desteği.
- Esnek CMS blok layout modları.
- Location/Stats item-count-aware layout.

## Sonraki Öncelikler

1. `next.config.mjs` reactCompiler uyarısını düzelt.
2. Header mobil menü deneyimini kontrol et/geliştir.
3. `FeaturedProductsBlock`, `ProcessBlock`, `LogoSliderBlock`, `CertificateGridBlock`, `NewsGridClient` için layout seçenekleri.
4. Ürün/RFQ/doküman erişim akışları için E2E test.
5. Çoklu dil stratejisini planla.

## Güvenli Geliştirme Kuralları

- `/urunler` ve `/teklif-sepeti` CMS route’a çevrilmemeli.
- `QuoteRequests`, `DownloadLogs`, `verify-manual`, `CartProvider` ve product query davranışı bozulmamalı.
- Payload schema değişince `src/payload-types.ts` güncel tutulmalı.
- Tema token sistemi korunmalı; hardcoded Tailwind renkleri eklenmemeli.
- Yeni client component yalnızca gerekli leaf seviyede `"use client"` kullanmalı.
- Yeni dependency ekleme; gerekirse önce gerekçelendir.

## Komutlar

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm lint:fix
pnpm typecheck
pnpm format
pnpm clean
pnpm payload:types
pnpm payload:graphql
pnpm db:generate
pnpm db:migrate
pnpm db:push
pnpm db:studio
```
