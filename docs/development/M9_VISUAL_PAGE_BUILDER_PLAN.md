# M9 Visual Page Builder Improvement Plan

## Objective

Improve the CMS page-builder system without weakening existing RFQ, SKU, protected-document, image-delivery or migration guarantees.

## Delivery packages

### Package 1 — Foundations and primary content blocks

- Shared `SectionShell` presentation system
- Shared `RenderBlocks` registry for homepage and dynamic CMS pages
- Expanded Hero block
- Expanded rich content block
- Expanded CTA block

### Package 2 — Supporting blocks

- Features block themes, card styles, media and links
- Stats block headings, themes, icons and compact trust-band mode
- Process block horizontal, vertical and card layouts
- Gallery captions and accessible previous/next lightbox navigation

### Package 3 — New block capabilities

- Timeline block
- Product-category showcase block backed by live CMS categories
- Video-media block with hosted and external video support

## Delivery policy

Each package uses its own feature branch, committed Payload migration, generated types/import map, CI run, browser regression run and manual visual verification. Pull requests are not merged without explicit approval.
