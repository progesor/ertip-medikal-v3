# Image Delivery Policy

The website uses two complementary image layers:

1. Payload CMS stores the original upload and creates configured media derivatives.
2. Next.js serves public website images through its managed image endpoint with responsive widths, WebP negotiation and cache reuse.

## Current delivery configuration

`next.config.mjs` defines:

- WebP as the managed output format;
- explicit quality tiers of `70`, `75` and `85`;
- a minimum optimized-image cache lifetime of one day.

The intended quality tiers are:

- `70`: small avatars, logos and thumbnails;
- `75`: normal cards, news images, team images and hero backgrounds;
- `85`: primary product imagery and fullscreen/lightbox views.

Every responsive `next/image` instance must include an accurate `sizes` value. Components must not use `unoptimized` merely to work around missing sizing information.

## Payload derivatives

The Media collection currently provides:

- `thumbnail`: small preview derivative;
- `card`: catalogue/card derivative;
- `hero`: wide hero derivative.

Components may use a Payload derivative when its crop and aspect ratio are appropriate. They must fall back to the original media URL so existing uploads and incomplete historical derivatives continue to render.

The product catalogue prefers the `card` derivative. Hero blocks prefer the `hero` derivative. Product-detail galleries keep the original image as the source for the main and fullscreen views while Next.js generates the requested delivery widths.

## Compatibility and safety

This delivery phase:

- does not change the database schema;
- does not require a Payload migration;
- does not rewrite, delete or convert existing uploads;
- does not change protected-document delivery;
- preserves original media URLs;
- allows the first request for a width/quality combination to populate the Next.js image cache.

SVG assets may remain effectively unoptimized by Next.js. PDF and other non-image media are never sent through the image optimizer.

## Upload policy

Do not force all uploads to WebP at ingestion time. The Media collection accepts both image and document uploads, and some assets require their original format or animation/transparency behavior.

A future ingestion pipeline may add format-specific conversion and backfill tools, but it must:

- classify raster images separately from SVG, GIF and documents;
- retain originals or provide a reversible migration path;
- define maximum dimensions and quality per content role;
- include a controlled backfill for existing media;
- verify that protected and public document references remain unchanged.

## Release smoke test

After deploying an image-delivery change to the non-public production environment:

1. Open the homepage and verify static and slider hero images.
2. Open `/urunler` and verify catalogue search, category filtering, manual ordering and pagination.
3. Open a product detail page and verify main, variant and shared gallery images.
4. Verify product gallery navigation, thumbnails and fullscreen mode.
5. Verify featured and related product cards.
6. Verify page gallery layouts and lightbox mode.
7. Verify news cards, certificates, team images, testimonials and logo sliders used by published pages.
8. Check browser Network requests and confirm raster images are served through `/_next/image` with successful responses.
9. Confirm no image optimizer `400` or `500` responses appear in browser or Coolify logs.
10. Compare mobile and desktop rendering for unexpected crops, stretching or layout shift.

## Operational notes

The Next.js image cache is deployment/runtime cache, not the canonical media store. A cache loss may cause temporary re-encoding work but must not cause data loss.

If image encoding CPU or cache storage becomes material, measure actual production traffic before changing formats, qualities or cache lifetime. Do not disable optimization globally as a performance shortcut.
