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

## CI Doğrulaması

GitHub Actions her pull request ve `main` güncellemesinde aşağıdaki kontrolleri çalıştırır:

- Payload type üretimi ve üretilen dosyanın commit ile uyumu
- TypeScript typecheck
- ESLint
- İzole PostgreSQL 17 ve Mailpit servisleri üzerinde production `next build`

Production build işi Coolify veya canlı veritabanına bağlanmaz. Her çalışmada geçici bir PostgreSQL veritabanı oluşturulur, Payload şeması yalnızca bu ortam için hazırlanır ve iş sonunda silinir. CI içinde kullanılan veritabanı ve e-posta servisi gerçek müşteri ya da ürün verisi içermez.

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

### Ürün Kataloğu Sıralaması

`productCatalog` grubu, ürün listeleme sırasını yönetir:

- `defaultSortMode`: `newest`, `oldest`, `manual`.
- `manualProductOrder`: Genel katalog için öncelikli manuel ürün sırası.

Her ürün kategorisi bu genel ayarı kullanabilir veya kendi `productSortMode`
ve `manualProductOrder` alanlarıyla kategoriye özel sıralama tanımlayabilir.
Manuel listede olmayan ürünler kaybolmaz; seçilen ürünlerin ardından en yeni
ürün önce olacak şekilde gösterilir.

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
