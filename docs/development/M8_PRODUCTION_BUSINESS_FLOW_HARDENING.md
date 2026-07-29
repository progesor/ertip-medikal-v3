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

The browser is not an authority for product names, variant titles, SKU values, availability, or publication state.

Required behavior:

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

No Payload schema change is required for this workstream.

### M8.2 — Critical-flow automated coverage

Planned coverage:

- authoritative quote item resolution;
- product and variant identity migration from legacy carts;
- inactive and stale item rejection;
- duplicate-line reconciliation;
- protected-document verification boundaries;
- cart-to-RFQ submission behavior;
- configurable SKU preview/apply safety.

Prefer pure Node/TypeScript tests for domain logic. Add browser E2E only where browser behavior is the subject of the test.

### M8.3 — Mobile header navigation

Required behavior:

- CMS navigation remains available below the desktop breakpoint;
- keyboard and screen-reader accessible open/close control;
- menu closes after navigation and Escape;
- search, quote cart, and configured CTA remain reachable;
- no server/client hydration mismatch;
- theme tokens remain the only color/radius source.

### M8.4 — Documentation and release closure

- update `PROJECT_STATUS.md` and `PROJECT_CONTEXT.md` to reflect production migrations, image optimization, security hardening, and configurable SKU rules;
- remove stale backlog statements that are already complete;
- record required Coolify and production smoke checks;
- close obsolete PRs only after confirming they have no unique unmerged value.

## Merge policy

- all implementation PRs start as draft;
- CI must be green;
- user performs only the manual checks explicitly identified as browser-dependent;
- no PR is merged without explicit user approval.
