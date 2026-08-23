# M10.4 — Admin UI Text Overrides

## Goal

Allow content managers to customize selected visitor-facing Turkish and English application UI strings without removing the typed dictionaries introduced in M10.3.

The code dictionaries remain canonical fallbacks. An empty or missing admin override never produces blank UI; the matching typed dictionary value is used instead.

## Scope

The Admin dashboard now includes a localized UI text editor alongside the existing English-content bootstrap control.

Editable surfaces intentionally focus on business-facing copy:

- quote-cart notification;
- product-detail badge, primary action, tabs and key headings;
- quote cart / RFQ headings, form labels, privacy note and success state;
- contact form labels and success state;
- unsubscribe headings, descriptions, actions and metadata title.

Technical errors, security wording, ARIA-only labels and low-level system strings remain code-owned.

## Storage

Overrides are stored in the application-owned PostgreSQL table `ertip_ui_text_overrides`.

Each locale (`tr`, `en`) has at most one row containing a JSONB whitelist of overrides. The table is deliberately separate from Payload's localized Site Settings schema so M10.4 does not expand or mutate the already-stabilized M10.1 localization tables.

Migration:

- `20260805_130000_m10_ui_text_overrides`

The migration only creates/drops this independent table and does not modify product, page, news, menu or Site Settings data.

## Safety model

Only predefined keys such as `product.addToQuoteCart` or `quote.title` are accepted.

On save:

1. unknown keys are discarded;
2. non-string values are discarded;
3. whitespace-only values are discarded;
4. values are trimmed and capped at 2,000 characters.

Admin access uses the existing content-manager boundary (`admin` or `editor`).

## Runtime resolution

For each public request:

1. resolve the active locale;
2. load the typed M10.3 dictionary;
3. read that locale's override JSON;
4. apply valid non-empty overrides;
5. provide the resolved dictionary through `SiteLocaleProvider`.

If the override table is unavailable or a read fails, the website falls back to the typed dictionary rather than failing the page request.

The unsubscribe metadata title uses the same resolved dictionary server-side.

## Admin UX

The dashboard editor has its own Turkish / English selector.

Each editable field shows the code default as both placeholder and helper text. Leaving a field blank restores fallback behavior for that key. A locale can also be reset completely to defaults.

## Validation

Before merge:

- TypeScript passes;
- ESLint passes;
- i18n tests validate whitelist normalization and locale defaults;
- migration applies cleanly in disposable PostgreSQL;
- migration-history / schema-drift checks remain green;
- production build passes;
- Browser E2E and RFQ regressions remain green;
- CodeQL remains green;
- local populated-DB smoke test confirms an admin override is visible on the corresponding public locale and clearing it restores the default.

## Merge policy

Do not merge M10.4 without explicit user approval.
