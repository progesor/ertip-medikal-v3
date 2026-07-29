# Ertip Medikal v3 — AI/Developer Context

Bu dosya projenin güncel kanonik geliştirici bağlamıdır. Eski sohbet notları veya tarihsel belgeler bu dosya ve güncel `main` ile çelişirse güncel kaynak kod ve bu bağlam esas alınır.

## Ürün özeti

Ertip Medikal v3, Next.js 16 + Payload CMS 3 tabanlı kurumsal medikal web sitesi, ürün/PIM yönetim sistemi ve B2B teklif talebi portalıdır.

Ana yetenekler:

- CMS Page Builder ve dinamik kurumsal sayfalar;
- ürün kataloğu ve ürün detay sayfaları;
- varyant ve SKU yönetimi;
- teklif sepeti ve RFQ akışı;
- korumalı doküman erişimi;
- admin kontrollü görsel optimizasyonu;
- tema, header, footer ve iletişim ayarları;
- güvenlik, RBAC, rate limit ve migration altyapısı.

## Teknik yığın

- Next.js `16.2.3`
- Payload CMS `3.79.1`
- React / React DOM `19.2.8`
- PostgreSQL `17`
- pnpm `10`
- Node.js `22` CI hedefi
- Coolify auto-deploy from `main`

## Ana rotalar

- `/`: CMS ana sayfa
- `/[slug]`: dinamik CMS sayfaları
- `/urunler`: ürün kataloğu
- `/urunler/[slug]`: ürün detay
- `/teklif-sepeti`: RFQ teklif sepeti
- `/haberler/[slug]`: haber detay
- `/abonelikten-ayril`: güvenli abonelikten çıkış
- `/admin/[[...segments]]`: Payload admin
- `/api/public/contact`: public iletişim endpointi
- `/api/public/newsletter`: public bülten endpointi
- `/api/public/quote-request`: doğrulanmış RFQ endpointi
- `/api/verify-manual`: korumalı doküman kod doğrulama
- `/api/protected-download`: imzalı korumalı dosya teslimatı
- `/api/image-delivery`: optimize görsel teslimatı

`/urunler` ve `/teklif-sepeti` sabit uygulama rotalarıdır; CMS sayfasına dönüştürülmemelidir.

## Payload koleksiyonları

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

## Payload global ayarları

- `site-settings`
- `main-menu`
- `emailSettings`
- `themeSettings`
- `image-optimization`

## Production deployment sözleşmesi

Coolify build komutu:

```bash
pnpm build:deploy
```

Bu komut:

```bash
pnpm db:migrate && pnpm build
```

çalıştırır.

Start komutu:

```bash
pnpm start
```

Production build komutu düz `pnpm build` olarak değiştirilmemelidir; committed migration zinciri deployment sırasında uygulanmalıdır.

## Migration politikası

- Payload-generated migration dosyaları `src/migrations` altında commitlenir.
- Production baseline adoption daha önce tamamlanmıştır.
- Schema değişikliği migration, generated Payload types ve gerektiğinde import-map güncellemesi olmadan merge edilmez.
- CI disposable PostgreSQL üzerinde migration zincirini, baseline adoption simülasyonunu ve schema drift’i doğrular.
- Production migration geçmişi elle düzenlenmez.

## Güvenlik sınırları

- Public formlar doğrudan Payload collection create endpointlerini kullanmaz.
- Contact, newsletter ve quote request özel server endpointlerinden geçer.
- Honeypot ve process-local rate limit uygulanır.
- Çoklu instance deployment olursa rate limit state’i Redis gibi ortak store’a taşınmalıdır.
- Admin ve editor rolleri ayrıdır.
- Korumalı dosyalar kısa ömürlü imzalı URL ile teslim edilir.
- Abonelikten çıkış açık e-posta parametresiyle mutation yapmaz; imzalı ve onaylı akış kullanır.
- Environment ve SMTP değişkenleri production başlangıcında doğrulanır.
- Raw HTML ürün açıklamalarında çalıştırılmaz.

## Görsel teslimat ve optimizasyon

- Orijinal media dosyaları korunur.
- Admin, WebP veya AVIF profil ayarlarını yönetir.
- Thumbnail, card, content ve fullscreen profilleri bulunur.
- Full-library optimizasyonu admin tarafından manuel başlatılır.
- Üretilen dosyalar persistent media volume altında tutulur.
- Eksik veya desteklenmeyen türevlerde güvenli original fallback uygulanır.
- Historical fixed-ratio crop türevleri public görüntü kaynağı olarak kullanılmaz.

## Ürün ve SKU sistemi

Products koleksiyonu başlık, kısa açıklama, Markdown açıklama, specs, görseller, varyantlar, lojistik, dokümanlar, kategoriler, ilgili ürünler ve SEO alanlarını içerir.

SKU profilleri:

- `legacy-punch`: doğrulanmış Ertip Punch SKU matrisi;
- `template`: token tabanlı genel SKU kuralı;
- `manual`: otomatik üretimi kapatır.

SKU motoru:

- ürün bazlı kombinasyon limiti uygular;
- duplicate ve collision kontrolü yapar;
- preview ile apply arasında stale fingerprint kontrolü yapar;
- varyantları kalıcı `combinationKey` ile uzlaştırır;
- fiyat, görsel, aktiflik, satır ID’si ve diğer manuel metadata’yı korur;
- geçersiz konfigürasyonda mevcut varyantları değiştirmez;
- mevcut Punch davranışını testlerle korur.

## RFQ ve teklif sepeti

- `CartProvider` localStorage tabanlıdır.
- Yeni sepet satırları ürün ID’si, SKU ve mümkünse `combinationKey` taşır.
- Eski localStorage sepetleri benzersiz SKU fallback ile desteklenir.
- Tarayıcıdan gelen ürün adı, varyant adı ve SKU kayıt için otorite değildir.
- RFQ endpointi yayınlanmış ürünü Payload’dan yeniden okur.
- Varyant önce `combinationKey`, eski sepetlerde exact unique SKU ile çözümlenir.
- Pasif, silinmiş, draft, stale veya belirsiz varyantlar reddedilir.
- Kayıt satırları güncel veritabanı ürün adı, varyant adı ve SKU ile oluşturulur.
- Duplicate logical satırlar güvenli biçimde birleştirilir.

## Header ve mobil navigasyon

- Desktop navigasyon server-rendered kalır.
- Mobil breakpoint altında erişilebilir hamburger menü bulunur.
- Menü CMS main-menu linklerini, ürün aramasını, teklif sepetini ve CTA’yı gösterir.
- Escape, backdrop ve link seçimi menüyü kapatır.
- Menü açıkken body scroll durdurulur.
- Renk ve radius yalnızca theme tokenlarından gelir.

## Tema ve tasarım sistemi

Yeni UI hardcoded renk veya radius eklememelidir.

Temel tokenlar:

- `primary`, `primary-foreground`
- `background`, `foreground`
- `surface`, `surface-muted`, `surface-inverse`
- `text-main`, `text-muted`
- `success`, `error`, `warning`, `info`, `destructive`
- `border`, `input`, `ring`
- `--radius`, `--radius-xl`, `--radius-2xl`, `--radius-3xl`

Mevcut görsel iyileştirme çalışmaları bu token sistemini ve Payload içerik modelini korumalıdır.

## Test katmanları

- `pnpm test:sku`: legacy ve configurable SKU karakterizasyonu
- `pnpm test:quote`: authoritative RFQ domain testleri
- `pnpm test:e2e`: Chromium mobil navigasyon, sahte RFQ kimliği reddi ve korumalı doküman istek sınırı
- `pnpm typecheck`
- `pnpm lint`
- Payload types/import-map drift kontrolleri
- migration ve production build CI

Browser E2E, production’a test-only seed endpointi eklemez; migrated boş database ve public sınırlar üzerinde çalışır. Başarılı RFQ persistence canlı/kopya ürünle manuel smoke testte doğrulanır.

## M8 durumu

M8 Production and Business Flow Hardening kapsamı:

- authoritative RFQ item validation;
- legacy cart compatibility;
- inactive/stale variant rejection;
- mobile hamburger navigation;
- RFQ domain tests;
- Chromium E2E;
- güncel status ve milestone dokümantasyonu.

Kapanış şartları:

- bütün CI kapıları yeşil;
- kullanıcı browser testlerini onaylamış;
- PR merge için ayrıca açık kullanıcı onayı verilmiş;
- merge sonrası production smoke sonucu exit report’a yazılmış.

## Sonraki ana yön: görsel tasarım ve sayfa deneyimi

M8 kapandıktan sonra ana milestone görsel ve UX geliştirmesi olacaktır.

Öncelikli inceleme alanları:

- ana sayfa hiyerarşisi ve marka sunumu;
- ürün katalog kartları, filtre alanları ve responsive grid;
- ürün detay sayfası, galeri, teknik bilgiler, dokümanlar ve RFQ CTA’ları;
- CMS bloklarının layout seçenekleri;
- header, footer ve navigasyon görünümü;
- tipografi, spacing, motion, empty/loading/error/success durumları;
- desktop, tablet ve mobil tutarlılığı;
- kritik sayfalar için visual regression koruması.

Bu çalışma görsel teslimat pipeline’ını, SKU motorunu, RFQ doğrulamasını, korumalı doküman güvenliğini ve route sözleşmelerini bozmamalıdır.

## Güvenli geliştirme kuralları

- Kullanıcı açıkça onaylamadan PR merge edilmez.
- Schema değişiklikleri migration’sız yapılmaz.
- Generated Payload types ve admin import-map drift’e bırakılmaz.
- `/urunler` ve `/teklif-sepeti` route sözleşmeleri korunur.
- Yeni client component yalnızca gerekli leaf seviyede `"use client"` kullanır.
- Yeni dependency gerekçeli olmalı ve lockfile commitlenmelidir.
- Secret değerler log, PR veya sohbette paylaşılmaz.

## Temel komutlar

```bash
pnpm dev
pnpm build
pnpm build:deploy
pnpm start
pnpm lint
pnpm typecheck
pnpm test:sku
pnpm test:quote
pnpm test:e2e
pnpm payload:types
pnpm payload:importmap
pnpm db:migrate
pnpm db:migrate:status
```
