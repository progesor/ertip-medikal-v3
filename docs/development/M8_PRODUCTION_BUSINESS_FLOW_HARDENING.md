# M8 — Production and Business Flow Hardening

Date: 2026-07-29

## Goal

Close the remaining production-facing integrity and usability gaps after the image optimization and configurable SKU milestones.

## Canonical starting point

- Repository: `progesor/ertip-medikal-v3`
- Base branch: `main`
- Starting commit: `d8c21e692f7a85813ea81c3752ae3b961d672170`
- Starting release state: configurable SKU profiles and preview/apply workflow merged in PR #15

## Workstreams

### M8.1 — Authoritative RFQ item validation

Status: implemented and manually verified in PR #16.

The browser is not an authority for product names, variant titles, SKU values, availability, or publication state.

Implemented behavior:

- the cart submits product identity, optional logical combination identity, displayed SKU, and quantity;
- the server loads the published Payload product;
- variant products resolve by `combinationKey` when supplied;
- legacy carts without a combination key resolve by an exact, unique SKU;
- inactive, deleted, missing, draft, ambiguous, or stale variants are rejected;
- stored quote rows are reconstructed from current database values;
- client-provided product/variant labels are never persisted as authoritative data;
- duplicate logical lines are merged safely;
- invalid requests never create `quote-requests` records;
- the public rate limit and honeypot behavior remain unchanged.

No Payload schema or database migration change was required.

### M8.2 — Critical-flow automated coverage

Status: implemented and passing in PR #16.

Coverage:

- pure Node/TypeScript tests for authoritative quote item resolution;
- legacy cart SKU compatibility;
- inactive, draft, stale, missing, and unknown-combination rejection;
- duplicate-line reconciliation and quantity bounds;
- existing configurable SKU preview/apply and legacy Punch characterization tests;
- Chromium E2E for mobile navigation behavior;
- Chromium E2E proving the live RFQ endpoint rejects forged product identity;
- Chromium E2E for protected-document request validation boundaries.

Browser tests intentionally use a migrated empty database rather than a privileged test-only seed endpoint. Successful live RFQ persistence remains covered by the user-approved manual test against a copied or safe product.

### M8.3 — Mobile header navigation

Status: implemented and manually verified in PR #16.

Implemented behavior:

- CMS navigation remains available below the desktop breakpoint;
- keyboard and screen-reader accessible open/close control;
- menu closes after navigation, backdrop selection, and Escape;
- search, quote cart, and configured CTA remain reachable;
- body scrolling is suspended while the panel is open;
- no server/client hydration mismatch;
- theme tokens remain the only color/radius source.

### M8.4 — Documentation and release closure

Status: ready for merge approval.

- `PROJECT_STATUS.md` reflects production migrations, image optimization, security hardening, configurable SKU rules, RFQ integrity, and mobile navigation;
- `PROJECT_CONTEXT.md` is now the current canonical developer context;
- this document records the M8 implementation and test contract;
- the final M8 exit report will record the merged canonical commit and production smoke result;
- obsolete historical PRs remain excluded from the release path and must not be merged into current `main`.

## Validation commands

```bash
pnpm test:sku
pnpm test:quote
pnpm test:e2e
pnpm payload:types
pnpm payload:importmap
pnpm typecheck
pnpm lint
pnpm db:migrate:status
pnpm build
```

## Post-M8 product direction

After M8 closes, the next main milestone will focus on visual design and page experience rather than another infrastructure feature batch.

Planned discovery areas:

- homepage visual hierarchy and brand presentation;
- product catalogue cards, filtering surfaces, spacing, and responsive behavior;
- product detail page composition, gallery, technical information, documents, and RFQ calls to action;
- CMS page block composition and additional layout variants;
- header, footer, navigation, typography, motion, empty states, and feedback states;
- consistent desktop, tablet, and mobile design quality;
- visual regression protection for the redesigned critical pages.

The design phase must preserve the current theme-token system, Payload content model, image-delivery pipeline, RFQ integrity, protected-document boundaries, and public route contracts.

## Merge policy

- all implementation PRs start as draft;
- CI must be green;
- user performs only the manual checks explicitly identified as browser-dependent;
- no PR is merged without explicit user approval.
