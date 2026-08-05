# M10.2 — Public Locale Routing

## Goal

Introduce explicit English and Turkish public URL spaces without duplicating the existing application route tree or weakening Payload localization boundaries.

M10.2 is a routing and data-isolation package. Full translation of application-owned fixed UI strings is intentionally handled in M10.3.

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

English pages must never silently borrow Turkish field values.

Where a listing depends on a localized slug, only records with a slug in the requested locale are surfaced.

## Existing-data transition

M10.1 migrated the existing production editorial data into Turkish locale rows only. It intentionally did not fabricate English translations.

Therefore immediately after M10.2:

- Turkish content continues to work under `/tr/...`;
- `/en` is a valid public locale namespace;
- untranslated English records do not silently display Turkish content;
- the English homepage redirects to the complete Turkish homepage until an English `home` locale is authored;
- record-level language switching is disabled when the same logical record has no target-locale slug yet.

## Language switching

The language switcher does not replace URL prefixes mechanically.

For localized Pages, Products and News it:

1. resolves the current record using the current locale slug;
2. keeps the record ID as the logical identity;
3. reads the same record in the target locale with `fallbackLocale: false`;
4. builds the target URL using the target locale slug.

This allows Turkish and English slugs to differ safely.

System routes such as catalog, news listing and quote cart map directly between their translated route segments.

## Page Builder links

Application-rendered internal links are normalized through locale-aware route helpers where M10.2 touches them. External `http(s)`, `mailto:`, `tel:` and fragment links are preserved unchanged.

Key Page Builder navigation surfaces covered by M10.2 include Hero, CTA, Media/Text, Hero Slider, Featured Products, Product Category Showcase and News Feed.

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

- [ ] `/` negotiates locale using cookie → Accept-Language → English default.
- [ ] `/en/products` rewrites to the existing product catalog with English locale context.
- [ ] `/tr/urunler` rewrites to the existing catalog with Turkish locale context.
- [ ] `/en/urunler` canonicalizes to `/en/products`.
- [ ] legacy `/urunler` redirects to `/tr/urunler`.
- [ ] `/en/news` and `/tr/haberler` resolve the news listing.
- [ ] admin/API/static assets bypass locale routing.
- [ ] public localized Payload queries do not use implicit fallback.
- [ ] language switch uses the same record ID and target localized slug.
- [ ] missing target translations do not produce mixed-language content.
- [ ] TypeScript, ESLint, production build and browser/RFQ/security workflows pass.
