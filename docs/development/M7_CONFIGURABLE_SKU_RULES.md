# M7 Configurable SKU Rules

Date: 2026-07-28

## Scope

This phase turns the extracted SKU engine into an administrator-configurable product feature.

It adds:

- persisted `legacy-punch`, `template`, and `manual` profiles;
- product-level combination limits;
- a generic template language;
- persisted logical combination keys on variant rows;
- preview and apply controls inside the product form;
- reconciliation reporting for preserved, added, changed, and removed variants;
- a committed Payload/PostgreSQL migration.

## Rule profiles

### Legacy Punch

Uses the user-verified Ertip diameter/length matrix and exact suffix spacing introduced in M7.1.

### Template

Supports these tokens:

- `{prefix}`
- `{suffix}`
- `{values}`
- `{value:Attribute Name}`
- `{raw:Attribute Name}`

`{value:...}` uses the configured normalization mode. `{raw:...}` uses the trimmed attribute value without normalization.

Normalization modes:

- `none`
- `compact`
- `uppercase-compact`
- `slug`

### Manual

Automatic preview and generation are disabled. Existing variants remain editable.

## Reconciliation order

Generated combinations are matched to existing variant rows in this order:

1. persisted `combinationKey`;
2. exact target SKU;
3. exact legacy Punch SKU for safe first-time migration to a template profile;
4. new variant row.

Matched rows preserve their manual metadata, including row identity, price, images, active state, and future custom fields. Generated title, SKU, and combination key are refreshed.

## Preview and apply

The product form includes a SKU Rule Workbench.

- **Preview** calculates the complete result without changing the form.
- The report shows preserved, added, SKU-changed, and removed counts.
- A stale preview cannot be applied after relevant form values change.
- **Apply to form** updates only the in-memory variants field.
- The administrator must still use Payload's normal Save button.
- Removing existing variants requires an explicit browser confirmation.

The server hook remains the final validation boundary for direct generation through the backwards-compatible checkbox.

## Migration policy

Migration `20260728_101500_configurable_sku_rules` adds profile/configuration columns to products and product versions, plus nullable `combination_key` columns to current and versioned variant rows.

The migration does not generate SKUs or backfill combination keys in SQL. Existing products default to `legacy-punch`. Keys are populated lazily through a verified preview/apply or explicit regeneration.

## Validation

Required checks:

```bash
pnpm test:sku
pnpm payload:types
pnpm payload:importmap
pnpm typecheck
pnpm lint
pnpm db:migrate
pnpm db:migrate:status
pnpm build
```

Manual admin validation should cover:

1. unchanged Punch output;
2. template preview with named attribute tokens;
3. price/image/active-state preservation after changing the template;
4. stale-preview rejection;
5. removal confirmation;
6. manual profile no-op behavior;
7. configurable combination-limit validation.

No pull request from this phase should be merged without explicit user approval.