# M10.2 — Public Locale Routing

## Goal

Introduce explicit English and Turkish public URL spaces without duplicating the existing application route tree or weakening Payload localization boundaries.

M10.2 also establishes a practical translation workflow: Turkish remains the source locale for most editorial authoring, while an explicit admin tool can initialize missing English localized content from Turkish so editors can focus on the text that actually needs translation.

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

The public website therefore never depends on implicit fallback. English content exists as English locale data even when its initial value was intentionally copied from Turkish.

Where a listing depends on a localized slug, only records with a slug in the requested locale are surfaced.

## Admin-driven English locale bootstrap

M10.1 safely moved the pre-existing single-language content into Turkish locale rows. Early M10.2 testing showed that empty English locale rows are inconvenient for editors because Page Builder structures and localized product fields otherwise have to be recreated manually.

M10.2 therefore adds an explicit **Eksik İngilizce İçeriği Türkçeden Doldur** control to the Payload Admin dashboard.

The tool is Owner/Admin only and fills only missing English localized values from Turkish for:

- Products;
- Categories;
- News;
- Pages, including the complete Page Builder layout;
- News Categories;
- Main Menu;
- localized Site Settings header, floating action and footer groups.

The tool is intentionally idempotent and can be run again whenever new Turkish content is added:

- an English field that already contains content is never overwritten;
- existing translations remain authoritative;
- empty English slugs are initialized from the Turkish slug and can then be changed independently;
- localized Page Builder / array rows receive fresh IDs before insertion;
- shared product identity such as SKU-driving data, variants, media and logistics remains shared exactly as defined by M10.1.

This is an explicit editorial action, not a deployment migration and not a hidden synchronization hook. `build:deploy` therefore never performs bulk editorial copying automatically.

Payload's own per-record Copy-to-Locale workflow remains available for cases where an editor deliberately wants to replace a locale with another locale's current content.

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
- [x] locale-bootstrap policy tests verify missing values copy without overwriting existing English values.
- [x] Page Builder bootstrap strips reused localized row IDs before insertion.
- [ ] run the Admin English-bootstrap tool against the populated local production snapshot and verify Pages/Page Builder, Products, Main Menu and Site Settings.
- [ ] final TypeScript, ESLint, production build and browser/RFQ/security workflows pass after the Admin tool changes.
