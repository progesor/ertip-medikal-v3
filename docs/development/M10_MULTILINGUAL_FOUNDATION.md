# M10 Multilingual Foundation

## Goal

Introduce first-class Turkish and English content management without duplicating products, pages, categories or news records. English is the intended default public language; Turkish remains fully supported.

## Locale policy

- Public default locale: `en`.
- Secondary locale: `tr`.
- Payload schema/default locale: `tr` deliberately, so the first localization migration preserves the existing Turkish-only production content in the Turkish locale instead of misclassifying it as English.
- Payload content fallback: disabled. Public English pages must not silently mix Turkish fields into otherwise English content.
- Frontend locale routing will explicitly request `locale` and `fallbackLocale: false` from the Payload Local API.

Payload's schema default locale and the website's public default locale are intentionally separate concerns.

## Localized content in the foundation migration

### Products

Localized:

- title
- short description
- Markdown description
- technical/specification array
- SEO metadata group
- slug

Shared:

- product identity and IDs
- category and related-product relationships
- main/gallery/variant images
- SKU and SKU rule configuration
- attributes that drive SKU generation
- variant `combinationKey`, SKU, price and active state
- logistics and dimensions
- protected-document access codes

Variant titles and SKU-driving attribute labels remain shared in M10.1. Their presentation localization will be handled without making the SKU engine locale-dependent.

### Pages

Localized:

- title
- complete Page Builder layout
- SEO metadata
- slug

Localizing the complete blocks field allows Turkish and English pages to have independent copy, CTA links, media choices and even block order when necessary.

### Categories

Localized:

- title
- description
- slug

Relationships, images and sorting remain shared.

### News

Localized:

- title
- excerpt
- rich-text content
- SEO metadata
- slug

Publication date, gallery and category relationship remain shared in this foundation.

### News categories

Localized:

- title
- slug

### Main menu

The complete menu items array is localized so each locale can have independent labels, references, manual links and ordering.

### Site settings

Localized groups:

- header
- floating action
- footer

Shared groups include logos, contact identity, product sort configuration and social-profile URLs.

## Deliberately deferred from M10.1

- locale-prefixed website routes (`/en`, `/tr`)
- automatic `Accept-Language` detection
- locale preference cookie
- header/mobile language switcher
- translated fixed application UI dictionary
- locale-aware RFQ/cart form labels and email copy
- localized variant presentation labels
- canonical/hreflang metadata
- multilingual sitemap and staging robots policy
- independent per-locale publication status (Payload localized status is experimental and is not required for the first release)

These follow after the data model and migration are proven safe.

## Migration safety

The existing production database is Turkish-only. The generated Payload migration must be reviewed to confirm existing localized values are moved into `tr` locale storage.

Before production deployment:

1. take and verify a full PostgreSQL backup;
2. apply the migration to a disposable clone of the production database;
3. verify representative pages, products, categories, news, menu and site settings in Turkish;
4. verify English localized fields are empty rather than silently populated with Turkish values;
5. run SKU, RFQ, Browser E2E, migration drift, typecheck, lint and production build gates;
6. only then deploy through `pnpm build:deploy`.

## Target routing (next package)

```text
/en
/en/products
/en/products/<localized-slug>
/en/about-us
/en/contact
/en/news

/tr
/tr/urunler
/tr/urunler/<localized-slug>
/tr/hakkimizda
/tr/iletisim
/tr/haberler
```

`/` will become a lightweight locale decision point. Explicit URL locale wins, followed by the saved user preference, browser `Accept-Language`, then the public default `en`.
