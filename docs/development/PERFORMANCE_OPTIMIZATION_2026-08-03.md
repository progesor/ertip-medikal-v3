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

Optimization goals:

1. Disable speculative product-detail prefetch on dense catalogue/showcase cards.
2. Make `next/image` `sizes` values match the real responsive grid and max-width container.
3. Adopt a more balanced default derivative ladder: `768 / 960 / 1440 / 2400`.
4. Route the header logo through the existing image-delivery pipeline instead of bypassing it.
5. Clear the two low-risk PageSpeed accessibility findings found in the same report.

Production safety:

Changing code defaults does not overwrite the saved `imageOptimization` global. After deploy, an administrator can enter the new widths in **Site Yapılandırması → Görsel Optimizasyonu**, save, then run **Tümünü Yeniden Oluştur**. This avoids changing the active image fingerprint during deployment itself.
