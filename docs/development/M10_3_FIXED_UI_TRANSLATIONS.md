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

The Page Builder newsletter block keeps its small interaction-state dictionary in `newsletterDictionary.ts`; its title, description and configured button text remain localized CMS fields.

## Locale boundary

Client components receive locale from the same server-resolved request context used by the public shell. They do not independently inspect browser language or Payload defaults.

This ensures `/en/...` consistently renders English application UI and `/tr/...` consistently renders Turkish application UI.

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

RFQ payload semantics are unchanged.

## Contact and newsletter flows

The contact form translates labels, placeholders, success/error states and privacy-notice presentation. If a department is selected, the internal message prefix reflects the request locale while preserving the selected CMS department label.

The newsletter Page Builder block translates only application-owned interaction states. CMS-provided block copy remains independently editable per locale.

## Unsubscribe flow

The unsubscribe request and confirmation UI, metadata title, loading/error states and return-home route are locale-aware. Public API contracts and token handling are unchanged.

## Typed parity gate

`tests/i18n/uiDictionary.types.ts` is compiled by `test:i18n` and enforces bidirectional structural parity between English and Turkish dictionaries. Adding a key to only one locale therefore fails the i18n TypeScript gate.

## Deliberately deferred

- multilingual canonical / `hreflang` / `x-default` metadata;
- multilingual sitemap and robots work;
- translating shared SKU-driving attributes/values;
- dependency advisory upgrades unrelated to i18n.

## Validation checklist

Before M10.3 closes:

- [ ] TypeScript passes.
- [ ] ESLint passes.
- [ ] `test:i18n` passes including dictionary parity.
- [ ] production build passes.
- [ ] `/en/quote-cart` displays English empty/form states.
- [ ] `/tr/teklif-sepeti` preserves Turkish empty/form states.
- [ ] `/en/unsubscribe` displays English interaction copy.
- [ ] `/tr/abonelikten-ayril` preserves Turkish interaction copy.
- [ ] product-detail tabs/actions are English under `/en` and Turkish under `/tr` when localized product data exists.
- [ ] existing RFQ, SKU and security regression workflows remain green.

## Merge policy

Do not merge M10.3 without explicit user approval.
