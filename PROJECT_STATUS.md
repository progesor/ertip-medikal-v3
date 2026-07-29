# Ertip Medikal v3 — Proje Durumu

Son güncelleme: 2026-07-29

Bu dosya, tamamlanan ana fazları ve sıradaki doğrulanmış işleri kısa şekilde takip eder. Güncel kaynak kod ve `main` branch her zaman kanonik uygulama kaynağıdır.

## Üretim Altyapısı

- Next.js 16.2.3 + Payload CMS 3.79.1 + PostgreSQL 17.
- Coolify `main` branch otomatik deploy.
- Production build komutu: `pnpm build:deploy`.
- Start komutu: `pnpm start`.
- `build:deploy`, committed Payload migrationlarını çalıştırdıktan sonra production build alır.
- Payload generated types, admin import map, migration zinciri, schema drift, typecheck, lint ve production build GitHub Actions ile doğrulanır.

## Tamamlanan Ana Kapsam

### Kurumsal site ve CMS

- Dinamik CMS Page Builder.
- Ürün kataloğu ve ürün detay sayfaları.
- Haberler, iletişim, bülten ve dinamik içerik sayfaları.
- Tema/token sistemi, dinamik header, footer ve hızlı iletişim butonu.
- Ürün galerisi, varyant görselleri, fullscreen ve klavye navigasyonu.
- Ürün sıralama, kategori filtreleme, arama ve pagination.

### Ürün/PIM ve SKU

- Attribute bazlı varyant üretimi.
- Doğrulanmış 55 kombinasyonlu Ertip Punch SKU matrisi.
- `legacy-punch`, `template` ve `manual` SKU profilleri.
- Ürün bazlı maksimum kombinasyon sınırı.
- Duplicate/collision kontrolleri.
- Kalıcı `combinationKey` ile varyant metadata reconciliation.
- Admin SKU önizleme, stale-preview koruması ve forma uygulama akışı.
- Fiyat, görsel, aktiflik ve manuel varyant alanlarının korunması.

### Güvenlik ve iş akışları

- Public form endpointleri için server-side validation, honeypot ve rate limiting.
- Admin/editor rol matrisi.
- Signed abonelikten çıkma akışı.
- Korumalı dokümanlar için private signed download route.
- Manual kod brute-force sınırları ve güvenli loglama.
- Environment/secret validation.
- Markdown raw HTML çalıştırılmasının engellenmesi.

### Görsel optimizasyonu

- Orijinal en-boy oranını koruyan WebP/AVIF türevleri.
- Admin kontrollü thumbnail, card, content ve fullscreen profilleri.
- Manuel tüm-kütüphane optimizasyonu ve ilerleme sayaçları.
- Orijinal dosya fallback’i ve protected-media uyumluluğu.
- Persistent media volume üzerinde güvenli derivative saklama.

### Production migration sistemi

Committed migrationlar:

1. `20260727_101107_production_baseline`
2. `20260727_131359_image_optimization_settings`
3. `20260728_101500_configurable_sku_rules`

## Aktif Milestone — M8 Production and Business Flow Hardening

Kanonik plan:

- `docs/development/M8_PRODUCTION_BUSINESS_FLOW_HARDENING.md`

### M8.1 RFQ server-side ürün doğrulaması

Durum: geliştirme ve otomatik test aşamasında.

- Browser ürün adı, varyant adı veya SKU için authority değildir.
- Teklif satırları published Payload ürününden yeniden oluşturulur.
- Yeni sepetler `combinationKey`, eski sepetler exact unique SKU ile çözülür.
- Draft, silinmiş, pasif, stale veya ambiguous ürün/varyantlar reddedilir.
- Duplicate mantıksal satırlar güvenli biçimde birleştirilir.

### M8.2 Kritik akış testleri

Durum: kademeli.

- RFQ domain testleri eklendi.
- Sırada route/browser seviyesinde cart→RFQ, korumalı doküman ve SKU preview/apply senaryoları var.

### M8.3 Mobil header navigasyonu

Durum: geliştirme ve browser QA aşamasında.

- CMS menü linkleri mobil hamburger panelinde erişilebilir olacak.
- Search, teklif sepeti ve CTA mobil panelden erişilebilir olacak.
- Escape, backdrop ve link seçimi ile kapanma desteklenecek.

### M8.4 Dokümantasyon ve release kapanışı

Durum: kısmen başladı.

- Bu durum dosyası güncellendi.
- `PROJECT_CONTEXT.md` modern mimari ve operasyon durumu ile güncellenecek.
- Obsolete PR #2 ve #4, benzersiz gerekli değişiklik içermediği doğrulandıktan sonra kapatılacak.

## M8 Sonrası Ürün Hedefleri

M8 kapandıktan sonra seçilebilir ana yönler:

1. CMS blokları ve kurumsal site görsel/layout geliştirmeleri.
2. Çoklu dil mimarisi ve içerik operasyonu.
3. Odoo/CRM ve raporlama entegrasyonları.
4. Gelişmiş PIM/SKU v2: alias, mapping, preset ve toplu işlemler.
5. Bayi veya müşteri portalı.

## Manuel Release QA

- `/`
- `/urunler`
- `/urunler/[slug]`
- `/teklif-sepeti`
- `/haberler/[slug]`
- `/abonelikten-ayril`
- Dinamik `/[slug]` CMS sayfaları
- Mobil header: aç/kapat, Escape, search, nav, cart, CTA
- Teklif talebi: geçerli ürün, pasif/stale ürün reddi, başarılı kayıt ve e-posta
- Payload Admin: Products, SKU Workbench, Quote Requests, Download Logs
- Coolify logs ve `pnpm db:migrate:status`

## Bilinen Operasyon Notları

- Windows/WSL ortamında CRLF/LF normalizasyon uyarıları görülebilir; tek başına içerik hatası değildir.
- Process-local rate limiter mevcut tek-instance Coolify deploy için uygundur. Çoklu replica kullanımında Redis veya paylaşımlı store gerekir.
- Yeni schema değişikliklerinde Payload migration, generated types ve import map birlikte commit edilmelidir.
