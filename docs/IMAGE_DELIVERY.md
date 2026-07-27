# Admin-Managed Image Optimization

The website keeps every original upload unchanged and uses a manually triggered optimization pipeline for public raster images.

The system has three layers:

1. Payload CMS stores the original media file in the persistent `media` volume.
2. An administrator chooses format, maximum width and quality settings in **Site Yapılandırması → Görsel Optimizasyonu**.
3. The administrator explicitly runs **Tüm Görselleri Optimize Et** to create persistent, aspect-ratio-safe derivatives.

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
| Thumbnail | 320 px | 70 | Avatars, logos and small previews |
| Card | 900 px | 75 | Product, news and catalogue cards |
| Content | 1600 px | 80 | Galleries, certificates and content images |
| Fullscreen | 2400 px | 85 | Product detail, hero and lightbox images |

Administrators may change every width and quality value. Quality is limited to `40–95`; width is limited to `64–3840` pixels.

The output format can be:

- **WebP**: default and recommended for balanced compatibility and CPU cost;
- **AVIF**: smaller output in many cases, but more expensive to generate.

Changing format, width or quality marks the current configuration as stale. The new settings do not become active until the administrator saves the global and runs the full optimization again.

## Manual run workflow

1. Open **Site Yapılandırması → Görsel Optimizasyonu**.
2. Change format, width or quality values as needed.
3. Save the Payload global.
4. Click **Tüm Görselleri Optimize Et**.
5. Keep the page open while the progress indicator advances.
6. Review the processed, skipped and error counts.

The browser sends small batches to the protected Payload endpoint. Only administrator users may read status or start a run.

The pipeline processes JPEG, PNG, WebP, AVIF and TIFF uploads. PDF, SVG and animated GIF files remain unchanged.

## Persistent output

Generated files are stored inside the existing persistent media volume:

```text
media/optimized/<settings-fingerprint>/<media-id>/<profile>.<format>
```

The settings fingerprint isolates different format/quality/size versions. After a successful full run, obsolete fingerprint directories are removed. Deleting or replacing a raster media record removes its generated variants and marks the optimizer as stale.

Original files are never rewritten or deleted by the optimizer.

## Public delivery

`next/image` continues to emit responsive `srcset` widths, but its custom loader routes Payload media URLs to:

```text
/api/image-delivery?src=<payload-media-url>&w=<requested-width>
```

The route:

1. validates that the source is a local Payload media URL;
2. resolves the media record;
3. reuses protected-media access checks;
4. chooses the smallest configured profile that can satisfy the requested width;
5. serves the generated WebP/AVIF file when available;
6. redirects to the original upload when optimization is disabled, stale because settings changed, not yet run, unsupported or missing.

When one media item changes after a successful run, existing generated files may continue to serve while that item falls back to its original. The admin panel reports that another manual run is required.

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
5. Open **Görsel Optimizasyonu**, save the default settings and run the full optimization.
6. Confirm progress reaches completion and error count is zero, or inspect every reported error.
7. Reload public pages and confirm image requests use `/api/image-delivery`.
8. Confirm generated responses use `image/webp` or `image/avif`.
9. Upload a new raster test image and confirm the admin status becomes stale while public rendering still falls back safely.
10. Re-run optimization and confirm the new image receives generated variants.
11. Confirm PDF, SVG and animated GIF behavior is unchanged.
12. Verify protected documents remain inaccessible without their existing authorization flow.
13. Check mobile and desktop layouts for crop, stretching and layout shift.
14. Check Coolify logs for image-delivery or Sharp errors.

## Operational requirements

- The application must keep `/app/media` or the configured media directory on persistent storage.
- The generated `media/optimized` directory must be included in media-volume backup policy, although it can be regenerated from originals.
- A full run consumes CPU and disk I/O, so it should be started during a quiet period when the media library is large.
- Do not run multiple optimization jobs at the same time.
- Do not delete the original media files after optimization.
