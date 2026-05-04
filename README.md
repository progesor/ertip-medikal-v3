# Ertip Medikal v3

Ertip Medikal v3, medikal cihaz ve saç ekimi enstrümanları üreticisi için geliştirilen kurumsal web sitesi, ürün bilgi yönetimi (PIM), B2B teklif toplama (RFQ) ve Payload CMS tabanlı içerik yönetim platformudur.

Proje yalnızca tanıtım sitesi değildir. Ürün katalog yönetimi, varyant/SKU üretimi, korumalı doküman erişimi, teklif sepeti, dinamik tema sistemi, CMS sayfa blokları, haberler, sertifikalar, iletişim talepleri ve hızlı iletişim aksiyonlarını tek Next.js uygulaması içinde toplar.

## İş Amacı

- Ertip Medikal markasını uluslararası, güvenilir ve premium bir medikal üretici kimliğiyle sunmak.
- Ürünleri kategori, varyant, teknik özellik, galeri ve dokümanlarıyla yönetilebilir hale getirmek.
- B2B müşterilerin ürün varyantlarını sepete ekleyip teklif talebi göndermesini sağlamak.
- Halka açık kataloglar ile erişim kodu gerektiren teknik/kullanım dokümanlarını ayırmak.
- İçerik ekiplerine Payload CMS üzerinden tema, header, footer, sayfa blokları ve iletişim alanlarını yönetme imkanı vermek.

## Teknoloji Yığını

| Katman | Teknoloji |
| --- | --- |
| Framework | Next.js 16.2.3, App Router |
| CMS | Payload CMS 3.79.1 |
| Veritabanı | PostgreSQL, `@payloadcms/db-postgres` |
| UI | React 19 RC, Tailwind CSS, Shadcn tarzı UI primitives |
| İkonlar | Lucide React |
| Animasyon | Framer Motion |
| Zengin metin | Payload Lexical, `react-markdown`, `md-editor-rt` |
| Stil altyapısı | CSS değişkenleri, Tailwind theme tokenları, `@tailwindcss/typography` |
| E-posta | Payload Nodemailer adapter |
| Yardımcı araçlar | Drizzle Kit, Sharp, ESLint, TypeScript |

## Mimari

Proje hibrit bir Next.js + Payload mimarisi kullanır.

- `src/app/(payload)`: Payload admin, REST API ve GraphQL route grubu.
- `src/app/(website)`: Kamuya açık web sitesi.
- `src/app/(website)/[slug]/page.tsx`: Payload `pages` koleksiyonundaki CMS sayfalarını Page Builder bloklarıyla render eder.
- `src/app/(website)/urunler`: Ürün katalog rotası. CMS bloklarına dönüştürülmemelidir.
- `src/app/(website)/urunler/[slug]`: Ürün detay rotası.
- `src/app/(website)/teklif-sepeti`: B2B teklif sepeti ve RFQ formu. CMS bloklarına dönüştürülmemelidir.
- `src/app/api/verify-manual/route.ts`: Korumalı ürün dokümanı erişim kodu doğrulama API’si.

## Temel Klasörler

| Yol | Açıklama |
| --- | --- |
| `src/collections` | Payload koleksiyonları |
| `src/globals` | Payload global ayarları |
| `src/blocks` | Payload Page Builder blok şemaları |
| `src/components/blocks` | CMS bloklarının frontend render bileşenleri |
| `src/components/layout` | Header, Footer, FloatingActionButton, HeaderActions |
| `src/components/product` | Ürün detay ve galeri bileşenleri |
| `src/components/admin` | Payload admin özel bileşenleri |
| `src/providers` | React context provider’ları, özellikle `CartProvider` |
| `src/lib/themeConfig.ts` | Tema paletleri ve radius presetleri |
| `src/styles/globals.css` | Tailwind ve varsayılan CSS değişkenleri |
| `src/payload.config.ts` | Payload ana konfigürasyonu |

## Payload Koleksiyonları

| Koleksiyon | Amaç |
| --- | --- |
| `users` | Payload admin kullanıcıları |
| `media` | Görsel, PDF ve medya yüklemeleri |
| `products` | Ürün/PIM sistemi |
| `categories` | Ürün kategorileri ve üst kategori ilişkisi |
| `pages` | CMS Page Builder sayfaları |
| `news` | Haber/duyuru içerikleri |
| `news-categories` | Haber kategorileri |
| `inquiries` | İletişim formu talepleri |
| `quote-requests` | B2B teklif talepleri |
| `download-logs` | Korumalı doküman erişim kayıtları |
| `subscribers` | E-bülten aboneleri |

## Payload Global Ayarları

| Global | İçerik |
| --- | --- |
| `site-settings` | Logo, header, iletişim, hızlı iletişim butonu, sosyal medya, footer |
| `main-menu` | Header ana navigasyon linkleri |
| `emailSettings` | İletişim ve teklif bildirim alıcıları |
| `themeSettings` | Renk paleti, radius ayarı ve canlı tema önizlemesi |

## Site Settings Sistemi

`src/globals/SiteSettings.ts` site genelini yöneten ana globaldir.

### Genel Logo Alanları

- `siteLogo`: Renkli ana logo.
- `whiteLogo`: Footer veya koyu zeminler için beyaz logo.
- `symbolLogo`: Yazısız/sembol logo. Header, kompakt alanlar veya mobil görünümler için kullanılabilir.

### Dinamik Header Ayarları

Header artık CMS üzerinden yönetilir:

- `showLogoInHeader`
- `headerLogoVariant`: `auto`, `default`, `white`, `symbol`
- `showCompanyNameInHeader`
- `showTaglineInHeader`
- `headerCompanyName`
- `headerTagline`
- `headerLayout`: `default`, `compact`, `brand`
- `headerCtaLabel`
- `headerCtaHref`

Header boş kalmayacak şekilde güvenli fallback içerir. Logo ve metin kapatılsa bile firma adıyla güvenli marka görünümü korunur.

### Footer Ayarları

Footer kolonları blok tabanlıdır:

- `textColumn`
- `menuColumn`
- `contactColumn`

Footer koyu/inverse tema tokenlarıyla çalışır ve `whiteLogo` varsa onu, yoksa ana logoyu kullanır.

### Hızlı İletişim Butonu

`floatingAction` grubu sabit hızlı iletişim butonunu yönetir:

- Tür: WhatsApp, telefon, e-posta, özel link.
- Konum: sağ alt veya sol alt.
- Görünüm: kapsül, mesaj balonu, sadece ikon.
- Renk stili: tema rengi veya WhatsApp yeşili.
- Metin, yardımcı metin, ikon görünürlüğü, yeni sekmede açma ve hafif hareket efekti.

Frontend bileşeni: `src/components/layout/FloatingActionButton.tsx`.

## Tema Sistemi

Tema altyapısı CSS değişkenleri, Tailwind tokenları, `ThemeSettings` globali ve `themeConfig.ts` üzerinden çalışır.

### Paletler

Mevcut paletler:

- `dark-luxury`
- `medical-blue`
- `medical-aqua`
- `ocean`
- `emerald`
- `clinical-mint`
- `premium-navy`
- `surgical-teal`
- `ruby`

### Önemli Tokenlar

- Ana: `primary`, `background`, `foreground`, `card`, `muted`, `accent`, `border`, `input`, `ring`
- Yüzey: `surface`, `surface-muted`, `surface-inverse`, `surface-inverse-foreground`
- Metin: `text-main`, `text-muted`
- Durum: `success`, `error`, `warning`, `info`, `destructive`
- Radius: `--radius`, `--radius-xl`, `--radius-2xl`, `--radius-3xl`

`src/app/(website)/layout.tsx`, `themeSettings` globalinden seçilen palet ve radius değerlerini runtime’da `:root` değişkenleri olarak basar.

### Admin Önizleme

`src/components/admin/ThemePreview.tsx`, Payload admin içinde tema paletini ve radius ayarını canlı önizler. Butonlar, kartlar, ürün kartı benzeri yüzeyler, formlar, durum renkleri, inverse/footer alanı, rich text örneği ve token swatch’ları içerir.

## CMS Page Builder Blokları

`pages` koleksiyonu aşağıdaki blokları destekler:

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

### Esnek Yerleşim İyileştirmeleri

Son geliştirmelerde önemli bloklar içerik sayısına göre daha akıllı render edilmeye başladı:

- `FeaturesBlock`: `layoutMode` (`auto`, `grid`, `featured`, `compact`) ve `alignment`.
- `TestimonialBlock`: `layoutMode` (`auto`, `featured`, `grid`).
- `TeamBlock`: `layoutMode` (`auto`, `featured`, `grid`).
- `GalleryBlock`: `galleryLayout` (`mosaic`, `grid`, `masonry`, `featured`).
- `LocationBlock`: `layoutMode` (`auto`, `single-column`, `two-column`, `grid`).
- `StatsBlock`: schema değişmeden item sayısına göre 1, 2, 3, 4 ve 5+ istatistikleri dengeli gridlerde render eder.

## Ürün/PIM Sistemi

`products` koleksiyonu medikal ürün katalog yönetimini sağlar.

Başlıca özellikler:

- Ürün başlığı, kısa açıklama, Markdown/HTML destekli detay açıklaması.
- Teknik özellikler (`specs`).
- Ana görsel, ürün galerisi, tanıtım videosu.
- Kategori ilişkisi ve ilgili ürünler.
- Varyant/SKU sistemi.
- Otomatik varyant üretimi için attribute tabanlı kombinasyon hook’u.
- Lojistik ölçüler ve paketleme bilgileri.
- Public dokümanlar ve korumalı dokümanlar.
- `isFeatured` ile vitrinde öne çıkarma.
- `isOriginalErtipProduct` ile ürün detayında “Orijinal Ertip Ürünü” etiketi.
- SEO meta alanları.

## Ürün Galerisi

`src/components/product/ProductGallery.tsx` ürün detayında kullanılır.

Mevcut özellikler:

- Ana görsel alanı.
- Thumbnail grid.
- Önceki/sonraki navigasyon.
- Fullscreen modal viewer.
- Klavye desteği: `Escape`, `ArrowLeft`, `ArrowRight`.
- Tema tokenlarına uyumlu yüzey, border ve inverse modal.

## Doküman ve Erişim Kodu Sistemi

Ürünlerde iki doküman tipi vardır:

- `publicDocs`: katalog, broşür gibi herkese açık belgeler.
- `protectedDocs`: erişim kodu/seri numarası gerektiren belgeler.

Korumalı doküman akışı:

1. Kullanıcı ürün detayında erişim kodu girer veya URL parametresiyle otomatik doğrulama tetiklenir.
2. `/api/verify-manual` kodu kontrol eder.
3. Kod geçerliyse doküman URL’i döner.
4. Erişim `download-logs` koleksiyonuna IP, ülke tahmini ve cihaz bilgisiyle kaydedilir.

Bu sistem ürün doküman erişim mantığına bağlıdır; değiştirirken dikkatli olunmalıdır.

## Quote Cart / RFQ Sistemi

Teklif sistemi e-ticaret ödeme akışı değildir; B2B teklif talebi toplama akışıdır.

Temel parçalar:

- `CartProvider`: `localStorage` destekli global teklif sepeti.
- `HeaderActions`: arama, sepet rozeti ve header CTA.
- `/teklif-sepeti`: müşteri bilgileri ve sepetteki ürünlerle teklif talebi oluşturur.
- `quote-requests`: admin panelinde teklif taleplerini saklar.
- `QuoteRequests` hook’u, `emailSettings.quoteReceivers` varsa e-posta bildirimi gönderir.

## İletişim, Bülten ve Bildirimler

- `ContactForm` ve `ContactFormBlock`, `inquiries` koleksiyonuna kayıt oluşturur.
- `Inquiries` hook’u, `emailSettings.contactReceivers` üzerinden bildirim e-postası gönderebilir.
- `NewsletterBlock`, `subscribers` koleksiyonuna kayıt oluşturur.
- `/abonelikten-ayril`, e-bülten abonelikten çıkma akışı için statik route olarak bulunur.

## Haber ve İçerik Sistemi

- `news` koleksiyonu başlık, özet, rich text içerik, kapak görseli, galeri, kategori ve SEO alanlarını içerir.
- `/haberler/[slug]` haber detay sayfasıdır.
- `NewsFeedBlock`, haberleri kategori filtrelemeli şekilde CMS sayfalarında gösterebilir.
- `news-categories`, haber kategori yönetimini sağlar.

## Admin ve Editör Araçları

- `MarkdownEditor`: Ürün açıklamaları için `md-editor-rt` tabanlı özel Markdown editörü.
- `ThemePreview`: Tema ve radius ayarlarını admin içinde canlı gösterir.
- Payload admin import map `src/app/(payload)/admin/importMap.js` tarafından yönetilir.

## Frontend Rotaları

| Route | Açıklama |
| --- | --- |
| `/` | Ana sayfa, Payload `pages` içeriğinden render edilir |
| `/[slug]` | Dinamik CMS sayfaları |
| `/urunler` | Ürün katalog/listing sayfası |
| `/urunler/[slug]` | Ürün detay sayfası |
| `/teklif-sepeti` | B2B teklif sepeti ve RFQ formu |
| `/haberler/[slug]` | Haber/duyuru detay sayfası |
| `/abonelikten-ayril` | E-bülten abonelikten çıkma sayfası |
| `/admin/[[...segments]]` | Payload admin |
| `/api/[...slug]` | Payload REST API |
| `/graphql` | Payload GraphQL |
| `/api/verify-manual` | Korumalı doküman erişim doğrulama API’si |
| `/sitemap.xml` | Next sitemap çıktısı |

## Geliştirme Komutları

Paket yöneticisi olarak `pnpm` kullanılır.

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

Temel yerel çalışma akışı:

```bash
pnpm install
pnpm dev
```

Veritabanı için `DATABASE_URI` gereklidir. SMTP bildirimleri için `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_NAME`, `SMTP_FROM_ADDRESS` gibi değişkenler kullanılır.

## Mevcut Tamamlanan Özellikler

- Next.js + Payload CMS monorepo yapısı.
- CMS Page Builder ve çok sayıda üretim odaklı blok.
- Gelişmiş ürün/PIM modeli.
- Varyant/SKU üretim hook’u.
- Ürün katalog, ürün detay, galeri ve ilgili ürün yapısı.
- RFQ teklif sepeti.
- Korumalı doküman doğrulama ve download loglama.
- Tema paleti ve radius ayarları.
- Admin canlı tema önizlemesi.
- Header/footer/site settings yönetimi.
- Yazısız/sembol logo desteği.
- Hızlı iletişim butonu.
- Haber, kategori, bülten ve iletişim formları.
- Esnek CMS blok layout modları.

## Bilinen Uyarılar ve Limitasyonlar

- `next.config.mjs` içinde `experimental.reactCompiler` kullanılıyor. Next.js 16 build çıktısı bu ayarın top-level `reactCompiler` alanına taşınmasını öneriyor.
- Header’da gerçek mobil hamburger menü yapısı kontrol edilmeli; mevcut HeaderActions arama/sepet/CTA üzerine kuruludur.
- `GalleryBlock` layout modları frontend’de çalışır, ancak tüm içerik kombinasyonları için manuel görsel QA önerilir.
- Bazı yorum ve ekip alanlarında rol/firma/bio gibi genişletilmiş içerikler planlanabilir; mevcut schema sınırlı alan içerir.
- Çoklu dil/i18n henüz bu README kapsamında tamamlanmış özellik olarak doğrulanmadı.

## Önerilen Sonraki Adımlar

1. `next.config.mjs` içindeki `experimental.reactCompiler` uyarısını düzeltmek.
2. Header için mobil menü/hamburger deneyimini güçlendirmek.
3. `FeaturedProductsBlock`, `ProcessBlock`, `LogoSliderBlock`, `CertificateGridBlock`, `NewsGridClient` için ek layout seçenekleri.
4. Site Settings içindeki hızlı iletişim butonunu farklı cihazlarda görsel QA’dan geçirmek.
5. Ürün detay, korumalı doküman ve RFQ akışları için uçtan uca test senaryoları yazmak.
6. Çoklu dil stratejisini Payload localized fields veya route bazlı i18n ile planlamak.

## Güvenli Geliştirme Notları

- `/urunler` ve `/teklif-sepeti` statik uygulama rotalarıdır; CMS blok rotalarına dönüştürülmemelidir.
- `QuoteRequests`, `DownloadLogs`, korumalı doküman doğrulama ve `CartProvider` davranışı dikkatle korunmalıdır.
- Tema sistemi üzerinde çalışırken `themeConfig.ts`, `globals.css`, Tailwind tokenları ve `ThemeSettings` birlikte düşünülmelidir.
- Hardcoded renk/radius eklemek yerine semantik tokenlar kullanılmalıdır.
- Payload schema değişikliklerinden sonra `pnpm payload:types` veya build/typecheck çıktısıyla `src/payload-types.ts` güncel tutulmalıdır.
