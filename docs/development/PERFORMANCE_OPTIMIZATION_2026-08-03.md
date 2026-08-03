# Catalogue Performance Optimization — 2026-08-03

Source measurement: PageSpeed Insights on `/urunler` after the production security hardening release.

Observed baseline:

- mobile Performance: 95
- desktop Performance: 100
- mobile LCP: about 2.9 s
- CLS: 0
- product card image requests include `w=750` on mobile and `w=640` on desktop
- the active optimizer ladder (`320 / 900 / 1600 / 2400`) therefore promotes common card requests to the 900 px derivative
- catalogue product links generate speculative Next.js RSC prefetch traffic for multiple dynamic product detail routes

Optimization scope:

1. Disable speculative product-detail prefetch on dense catalogue/showcase cards.
2. Make `next/image` `sizes` values match the real responsive grid and max-width container.
3. Recommend a more balanced production derivative ladder: `384 / 768 / 1440 / 2400`.
4. Route the header logo through the existing image-delivery pipeline instead of bypassing it.
5. Clear the low-risk heading-order and icon-control accessibility findings found in the same report.

Why `384 / 768 / 1440 / 2400`:

- a 180 px header logo on a high-DPR display typically resolves near the 384 px derivative;
- a roughly 300–375 CSS px catalogue card on DPR 2 commonly asks Next.js for `640`, `750` or a nearby source width, which is satisfied by the 768 px card derivative instead of the historical 900 px file;
- 1440 and 2400 retain suitable upper tiers for content, product detail, hero and lightbox use;
- the four-profile schema remains unchanged, so no database migration is needed.

Production safety:

The committed Payload schema defaults intentionally remain `320 / 900 / 1600 / 2400`. The recommended ladder is an operational CMS setting, not a schema default change. After deploy, an administrator can enter `384 / 768 / 1440 / 2400` in **Site Yapılandırması → Görsel Optimizasyonu**, keep the quality values at `72 / 75 / 80 / 85`, save, then run **Tümünü Yeniden Oluştur** once. Deployment itself therefore does not change the active image fingerprint or require a database migration.
