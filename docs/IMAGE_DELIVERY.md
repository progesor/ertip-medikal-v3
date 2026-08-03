# Admin-Managed Image Optimization

The website keeps every original upload unchanged and uses a manually triggered optimization pipeline for public raster images.

The system has three layers:

1. Payload CMS stores the original media file in the persistent `media` volume.
2. An administrator chooses format, maximum width and quality settings in **Site Yapılandırması → Görsel Optimizasyonu**.
3. The administrator runs **Yeni / Değişenleri Optimize Et** for routine uploads and replacements, or **Tümünü Yeniden Oluştur** when every derivative must be regenerated.

No public request performs expensive image encoding. Public delivery either serves an already generated derivative or falls back to the original media file.

## Crop policy

Public product and content images must not use historical Payload derivatives that were created with a fixed width and height. Those files contain irreversible centre crops.

The Media collection now:

- disables Payload crop and focal-point controls;
- creates its helper sizes with width only;
- uses `withoutEnlargement`;
- rewrites historical public `sizes.*.url` values to the original media URL;
- preserves the original aspect ratio for all newly generated helper sizes.

The manual optimizer also uses Sharp with `fit: inside` and `withoutEnlargement: true`. It never crops an image.

## Admin settings

The `imageOptimization` global contains four profiles:

| Profile | Default width | Default quality | Typical use |
| --- | ---: | ---: | --- |
| Thumbnail | 384 px | 72 | Logos, avatars and small high-DPR previews |
| Card | 768 px | 75 | Product, news and catalogue cards |
| Content | 1440 px | 80 | Galleries, certificates and content images |
| Fullscreen | 2400 px | 85 | Product detail, hero and lightbox images |

Administrators may change every width and quality value. Quality is limited to `40–95`; width is limited to `64–3840` pixels.

The output format can be:

- **WebP**: default and recommended for balanced compatibility and CPU cost;
- **AVIF**: smaller output in many cases, but more expensive to generate.

Changing format, width or quality marks the current configuration as stale. The new settings do not become active until the administrator saves the global and runs **Tümünü Yeniden Oluştur**.

Existing installations keep their saved CMS values when code defaults change. To adopt the balanced `384 / 768 / 1440 / 2400` ladder, enter those widths in **Site Yapılandırması → Görsel Optimizasyonu**, keep WebP unless there is a specific AVIF need, save, and run **Tümünü Yeniden Oluştur** once. Deployment itself does not overwrite the active profile fingerprint.

## Admin component import map

Payload resolves custom admin components through the generated file:

```text
src/app/(payload)/admin/importMap.js
```

The optimizer control must be present under the key:

```text
/components/admin/ImageOptimizationControl#ImageOptimizationControl
```

The repository exposes `pnpm payload:importmap`, and both `pnpm dev` and `pnpm build` regenerate the map before starting. CI regenerates the map and fails if the committed file drifts. Do not edit `importMap.js` manually.

## Manual run workflow

The optimization control panel is rendered directly below the **Görsel Optimizasyonu** page title and above the editable settings, so the action buttons and run status remain visible without relying on a custom UI field inside the form.

1. Open **Site Yapılandırması → Görsel Optimizasyonu**.
2. Change format, width or quality values as needed.
3. Save the Payload global.
4. For normal uploads or replacements, click **Yeni / Değişenleri Optimize Et**. Existing complete derivatives are detected and skipped.
5. Use **Tümünü Yeniden Oluştur** only after a format/profile change or when every derivative must be regenerated.
6. Keep the page open while the progress indicator advances.
7. Review the processed, skipped and error counts.

The browser sends small batches to the protected Payload endpoint. Only administrator users may read status or start a run.

The pipeline processes JPEG, PNG, WebP, AVIF and TIFF uploads. PDF, SVG and animated GIF files remain unchanged.

## Persistent output

Generated files are stored inside the existing persistent media volume:

```text
media/optimized/<settings-fingerprint>/<media-id>/<profile>.<format>
```

The settings fingerprint isolates different format/quality/size versions. After a successful run, obsolete fingerprint directories are removed. Deleting or replacing a raster media record removes its generated variants and marks the optimizer as stale.

Original files are never rewritten or deleted by the optimizer.

## Public delivery

`next/image` continues to emit responsive `srcset` widths, but its custom loader routes Payload media URLs to:

```text
/api/image-delivery?src=<payload-media-url>&w=<requested-width>
```

The route:

1. validates that the source is a local Payload media URL;
2. resolves the media record from either its original filename or a Payload helper-size filename;
3. reuses protected-media access checks;
4. chooses the smallest configured profile that can satisfy the requested width;
5. serves the generated WebP/AVIF file when available;
6. redirects to the original upload when optimization is disabled, not yet run, unsupported or missing.

When one media item changes after a successful run, its generated files are removed and that item falls back to its original. The admin panel reports that the new/dechanged media optimization should be run. Previously completed derivatives remain in place and are skipped by an incremental run.

CMS-driven homepage and dynamic page routes are request-dynamic so newly published media and block changes become visible without waiting for a new application deployment.

Protected documents and protected media cannot be exposed through the image-delivery route.

## Database migration

The feature adds one Payload global and therefore requires the committed migration:

```text
20260727_131359_image_optimization_settings
```

It creates only:

- the `image_optimization` global table;
- the output-format enum;
- the optimization-status enum.

It does not alter product, media or content tables.

Production deployment continues to use:

```bash
pnpm build:deploy
```

The committed migration runs before the production build.

## Release smoke test

After deploying privately:

1. Open `/urunler` and confirm every product remains fully visible without centre crop.
2. Test catalogue search, categories, ordering and pagination.
3. Open a product page and test main, shared and variant images, thumbnails and fullscreen mode.
4. Verify hero, gallery, news, certificate, team, testimonial, logo, featured-product and related-product images.
5. Open **Görsel Optimizasyonu**, save the desired settings and run **Tümünü Yeniden Oluştur** once for a clean baseline.
6. Confirm progress reaches completion and error count is zero, or inspect every reported error.
7. Reload public pages and confirm image requests use `/api/image-delivery`.
8. Confirm generated responses use `image/webp` or `image/avif`.
9. Upload a new raster test image and confirm the admin status becomes stale while public rendering still falls back safely.
10. Run **Yeni / Değişenleri Optimize Et** and confirm only the new image is processed while existing derivatives are skipped.
11. Confirm PDF, SVG and animated GIF behavior is unchanged.
12. Verify protected documents remain inaccessible without their existing authorization flow.
13. Check mobile and desktop layouts for crop, stretching and layout shift.
14. Check Coolify logs for image-delivery or Sharp errors.

## Operational requirements

- The application must keep `/app/media` or the configured media directory on persistent storage.
- The generated `media/optimized` directory must be included in media-volume backup policy, although it can be regenerated from originals.
- A full rebuild consumes CPU and disk I/O; prefer the incremental action during routine content operations.
