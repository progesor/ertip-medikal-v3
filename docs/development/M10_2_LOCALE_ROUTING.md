# M10.2 — Public Locale Routing

## Goal

Introduce explicit English and Turkish public URL spaces without duplicating the existing application route tree or weakening Payload localization boundaries.

M10.2 also establishes a practical translation workflow: Turkish remains the source locale for authoring new records, while missing English localized content is initialized from Turkish so editors can translate only the fields that need to differ.

Full translation of application-owned fixed UI strings is intentionally handled in M10.3.

## Public URL contract

| Logical destination | English | Turkish |
| --- | --- | --- |
| Home | `/en` | `/tr` |
| Product catalog | `/en/products` | `/tr/urunler` |
| Product detail | `/en/products/{slug}` | `/tr/urunler/{slug}` |
| News | `/en/news` | `/tr/haberler` |
| News detail | `/en/news/{slug}` | `/tr/haberler/{slug}` |
| Quote cart | `/en/quote-cart` | `/tr/teklif-sepeti` |
| Unsubscribe | `/en/unsubscribe` | `/tr/abonelikten-ayril` |
| CMS page | `/en/{localized-slug}` | `/tr/{localized-slug}` |

The internal Next.js application routes remain unchanged. In particular, the locked `/urunler` and `/teklif-sepeti` routes remain first-class static application routes.

## Routing architecture

`src/proxy.ts` is the public routing boundary for Next.js 16.

For localized public URLs it:

1. parses the locale prefix;
2. canonicalizes translated system route segments;
3. records the explicit locale in the `ertip-locale` cookie;
4. injects `x-ertip-locale` and `x-ertip-public-path` request headers;
5. rewrites the public URL to the existing internal application route.

Proxy performs no Payload/database reads.

### Root negotiation

`/` resolves locale in this order:

1. saved `ertip-locale` cookie;
2. `Accept-Language`;
3. public default locale `en`.

An explicit `/en/...` or `/tr/...` URL always wins and refreshes the preference cookie.

### Legacy URLs

Existing pre-M10 unprefixed public URLs represent Turkish content. They redirect to the equivalent `/tr/...` public path rather than being silently treated as English.

Admin, API, Next.js internal paths and public files bypass locale routing.

## Payload data boundary

All localized public reads introduced or touched by M10.2 must specify both:

```ts
locale,
fallbackLocale: false,
```

This includes:

- Pages and Page Builder layout;
- Products and product categories;
- News and news categories;
- Main Menu;
- localized Site Settings groups.

The public website therefore never depends on implicit fallback. English content exists as English locale data even when its initial value was copied from Turkish.

Where a listing depends on a localized slug, only records with a slug in the requested locale are surfaced.

## English locale bootstrap

M10.1 safely moved the pre-existing single-language content into Turkish locale rows. M10.2 adds an explicit English bootstrap step to avoid empty Page Builder and product editing experiences.

Migration `20260805_105000_m10_2_bootstrap_english_content` initializes only missing English localized values from Turkish for:

- Products;
- Categories;
- News;
- Pages, including the complete Page Builder layout;
- News Categories;
- Main Menu;
- localized Site Settings header, floating action and footer groups.

The migration never overwrites an English field that already contains content. Existing translations therefore remain authoritative.

Localized arrays and Page Builder block structures receive fresh row IDs while their content, media/relationship references and structure are copied. Shared product data such as SKU identity, variants, logistics and media relationships remains shared exactly as defined by M10.1.

The initial English slug is copied from Turkish when English has no slug. Editors can later change the English slug independently.

### New records

When a new localized collection record is created in Turkish, an after-create hook initializes its missing English localized fields from the just-created Turkish record. This applies to Products, Categories, News, Pages and News Categories.

This is intentionally a one-time bootstrap, not continuous synchronization:

- later English translations are never overwritten by Turkish edits;
- intentionally different English Page Builder structures remain possible;
- existing English content is never reset when Turkish content changes.

Payload's own Copy-to-Locale workflow remains available for cases where an editor deliberately wants to replace a locale with another locale's current content.

## Language switching

The language switcher does not replace URL prefixes mechanically.

For localized Pages, Products and News it:

1. resolves the current record using the current locale slug;
2. keeps the record ID as the logical identity;
3. reads the same record in the target locale with `fallbackLocale: false`;
4. builds the target URL using the target locale slug.

This allows Turkish and English slugs to differ safely.

System routes such as catalog, news listing and quote cart map directly between their translated route segments.

Locale switching uses a full document navigation intentionally. The locale context is injected by Proxy request headers and shared Server Component layouts such as Header/Main Menu/Footer must be reconstructed in the same navigation. This prevents the target page body changing language while shared navigation remains stale until a manual browser refresh.

## Page Builder links

Application-rendered internal links are normalized through locale-aware route helpers where M10.2 touches them. External `http(s)`, `mailto:`, `tel:` and fragment links are preserved unchanged.

Key Page Builder navigation surfaces covered by M10.2 include Hero, CTA, Media/Text, Hero Slider, Featured Products, Product Category Showcase, News Feed and Video Media.

## Deliberately deferred to M10.3

M10.3 will provide typed dictionaries and complete fixed UI translation for application-owned strings, including at minimum:

- ProductView tabs, logistics labels, document access messages and quote-cart action text;
- quote cart / RFQ form labels, validation fallbacks and success states;
- unsubscribe flow copy;
- remaining reusable form and interaction labels.

SKU identity, SKU-driving attribute/value data and business records remain shared. Presentation labels may be translated without changing SKU semantics.

## Deliberately deferred SEO work

Canonical URLs, `hreflang`, multilingual sitemap generation, robots policy and `x-default` are handled in the later multilingual SEO package rather than in Proxy.

## Validation checklist

Before M10.2 closes:

- [x] `/` negotiates locale using cookie → Accept-Language → English default.
- [x] `/en/products` rewrites to the existing product catalog with English locale context.
- [x] `/tr/urunler` rewrites to the existing catalog with Turkish locale context.
- [x] `/en/urunler` canonicalizes to `/en/products`.
- [x] legacy `/urunler` redirects to `/tr/urunler`.
- [x] `/en/news` and `/tr/haberler` resolve the news listing.
- [x] admin/API/static assets bypass locale routing.
- [x] public localized Payload queries do not use implicit fallback.
- [x] language switch uses the same record ID and target localized slug.
- [x] shared layout navigation is rebuilt immediately after locale switching.
- [x] missing English fields bootstrap from Turkish without overwriting existing English content.
- [x] Page Builder bootstrap strips reused localized row IDs before insertion.
- [ ] verify the bootstrap migration against the project's populated local/test database before merge.
- [ ] final TypeScript, ESLint, production build and browser/RFQ/security workflows pass after the bootstrap changes.
