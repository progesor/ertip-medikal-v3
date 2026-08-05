# M10.3 — Fixed Public UI Translations

## Goal

Complete the English/Turkish split for application-owned public interface text after M10.1 localized the CMS model and M10.2 established locale-aware routing and strict Payload reads.

M10.3 does **not** translate editorial CMS content. Page, product, news, menu and site-setting copy remains authored per locale in Payload. This package covers labels, form states, accessibility text and interaction feedback owned by the application code.

## Architecture

The website layout resolves the request locale on the server and provides it to client components through `SiteLocaleProvider`.

Application-owned strings live in typed dictionaries under `src/lib/i18n/` rather than being inferred from URL text inside each component.

Primary surfaces use `uiDictionary.ts`:

- quote-cart toast;
- product gallery controls and accessibility labels;
- product detail interactions, logistics labels and tabs;
- quote cart / RFQ form;
- contact form;
- unsubscribe flow.

Smaller Page Builder interaction surfaces use focused dictionaries:

- `newsletterDictionary.ts` for newsletter form state;
- `galleryBlockDictionary.ts` for gallery/lightbox controls;
- `certificateDictionary.ts` for certificate viewer labels and fallback copy.

Location Block is a Server Component and resolves a small EN/TR label set directly from the request locale, avoiding unnecessary client JavaScript.

Editorial titles, descriptions, captions, certificate names, location details and configured button text remain localized CMS fields.

## Locale boundary

Client components receive locale from the same server-resolved request context used by the public shell. They do not independently inspect browser language or Payload defaults.

This ensures `/en/...` consistently renders English application UI and `/tr/...` consistently renders Turkish application UI.

### Persistent-layout language switching

The public Header lives in a shared Next.js layout. A client-side navigation can therefore move from the initial page to another public route without rebuilding the Server Component header. A language-switch target calculated only during the first server render would become stale and could send the user back to the first page they opened.

`LanguageSwitcher` now follows the browser's current public pathname. The first server-rendered page reuses the already-resolved alternate URL. After a client-side route change, the switcher requests `/api/public/alternate-locale` for the **current** pathname before enabling the target-language link.

The resolver reuses `resolveAlternateLocaleHref`, so system routes map directly while products, news items and CMS pages resolve the opposite locale's slug from the same Payload record ID. During resolution the switcher is temporarily disabled rather than exposing a stale href.

This keeps language changes on the same logical page even when EN/TR slugs differ.

## Product UI

Product editorial fields (`title`, `shortDescription`, `description`, `specs`) continue to come from Payload in the active locale.

Application-owned labels now include:

- quote-cart action;
- description / model / video / documents tabs;
- logistics and packaging headings;
- dimensions and weight labels;
- stock/status labels;
- document-access instructions and errors;
- public/protected document action labels;
- gallery controls and ARIA labels.

SKU identity and SKU-driving attribute/value data stay shared exactly as defined by M10.1. M10.3 translates presentation chrome without changing SKU semantics.

### Cross-locale quote-cart identity

The quote cart stays shared across language switches because it represents the same requested products and SKU identities. Each newly added item can also carry the product's localized `title + slug` presentation map for both locales.

The current locale uses that presentation identity for the visible product title and detail-page link. This prevents a product added in Turkish from linking to a Turkish slug while the user is later browsing the English cart, especially after editors make EN and TR slugs different.

Legacy browser carts without the presentation map remain valid and fall back to their stored title/slug.

## Quote cart / RFQ

The quote cart uses the current locale from `SiteLocaleProvider`, including its catalog/product links and all form text.

Translated states include:

- empty cart;
- selected products;
- quantity/remove accessibility labels;
- customer/contact fields;
- submission progress;
- generic client-side failure states;
- successful request confirmation.

RFQ payload semantics are unchanged. The server still receives product ID, SKU/combination identity and quantity rather than trusting localized presentation strings.

## Contact and newsletter flows

The contact form translates labels, placeholders, success/error states and privacy-notice presentation. If a department is selected, the internal message prefix reflects the request locale while preserving the selected CMS department label.

The newsletter Page Builder block translates only application-owned interaction states. CMS-provided block copy remains independently editable per locale.

## Page Builder interaction audit

M10.3 also audits Page Builder components that already receive localized CMS content but had fixed Turkish interaction chrome.

Covered surfaces include:

- Gallery lightbox fallback alt text, helper text, viewer title and previous/next/close labels;
- Certificate Grid trust badge, viewer controls, fallback scope copy, PDF action and save guidance;
- Location Block map fallback, map frame title, primary-location badge and external-map action.

Hero Slider, News Grid and Video Media already carried explicit locale-aware fixed labels from M10.2 and remain unchanged.

## Unsubscribe flow

The unsubscribe request and confirmation UI, metadata title, loading/error states and return-home route are locale-aware. Public API contracts and token handling are unchanged.

## Typed parity gate

`tests/i18n/uiDictionary.types.ts` is compiled by `test:i18n` and enforces bidirectional structural parity between the main English and Turkish dictionaries. Adding a key to only one locale therefore fails the i18n TypeScript gate.

Focused dictionaries are also compiled by the normal TypeScript/production-build gates.

## Deliberately deferred

- optional admin-managed overrides for selected application-owned UI copy; typed dictionaries should remain the fallback rather than moving every system/accessibility string into CMS;
- multilingual canonical / `hreflang` / `x-default` metadata;
- multilingual sitemap and robots work;
- translating shared SKU-driving attributes/values;
- dependency advisory upgrades unrelated to i18n.

## Validation checklist

Before M10.3 closes:

- [x] TypeScript passes.
- [x] ESLint passes before the final language-switch regression patch.
- [x] `test:i18n` passes including dictionary parity.
- [x] production build passes before the final language-switch regression patch.
- [x] `/en/quote-cart` displays English empty/form states in Browser E2E.
- [x] `/tr/teklif-sepeti` preserves Turkish empty/form states in Browser E2E.
- [x] `/en/unsubscribe` displays English interaction copy in Browser E2E.
- [x] `/tr/abonelikten-ayril` preserves Turkish interaction copy in Browser E2E.
- [x] Browser E2E includes a persistent-layout regression: enter `/tr`, navigate client-side to quote cart, then switch to `/en/quote-cart` rather than returning to the initial page.
- [x] RFQ regression validation passes.
- [x] CodeQL passes before the final language-switch regression patch.
- [ ] final current-head TypeScript / ESLint / build / Browser E2E / RFQ / CodeQL remain green.
- [ ] populated local smoke test confirms product-detail language switching with real localized product slugs if desired before merge.

## Merge policy

Do not merge M10.3 without explicit user approval.
