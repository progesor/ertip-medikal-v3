# M7 SKU Engine Foundation

Date: 2026-07-28

## Scope

This batch extracts the current Punch variant and SKU generation behavior into a pure, testable engine without changing the Payload product schema or database shape.

The production image optimization rollout is considered verified before this work:

- the full media library optimization completed successfully in Payload Admin;
- the mobile PageSpeed Insights performance score improved from 92 to 97 after optimization.

## Compatibility contract

The `legacy-punch` implementation preserves the valid historical behavior from the original `Products.ts` hook:

- attribute values remain hyphen-separated;
- combinations retain their current Cartesian-product order;
- titles remain `<value> mm <attribute>` joined with ` - `;
- `Çap` and `Uzunluk` use the existing Punch code transformation;
- non-Punch attributes retain concatenation with periods removed;
- prefix formatting remains unchanged;
- suffix formatting remains one leading space plus the trimmed suffix;
- existing variant metadata is preserved by exact generated-SKU match;
- normal saves do not regenerate variants;
- the explicit generation checkbox resets after a successful generation.

## Added safety boundaries

The extracted engine rejects generation before replacing variants when:

- an accepted attribute has no usable values;
- the Cartesian product exceeds the temporary server-side ceiling of 500 combinations;
- multiple generated combinations produce the same SKU;
- existing variants already contain an ambiguous duplicate SKU.

Failures leave the existing variant array untouched.

The 500-combination ceiling is intentionally an internal foundation default. A configurable product-level limit belongs to the later Payload schema and admin-preview phase.

## Logical combination identity

The engine now calculates a deterministic `combinationKey` for every candidate from ordered attribute-name and value pairs. The key is not persisted in this schema-free batch. It establishes the identity model that the next migration can store for safe reconciliation when SKU templates change.

## Payload integration

`ProductsWithSkuEngine.ts` is a transitional collection adapter. It keeps the existing schema in `Products.ts` but replaces the registered `beforeChange` hook with the extracted engine.

This avoids a schema migration and generated Payload-type change in the foundation batch. The obsolete inline hook remains unreachable at runtime and should be removed when the product collection is split into schema modules during the schema-focused phase.

## Validation

Run:

```bash
pnpm test:sku
pnpm payload:types
pnpm payload:importmap
pnpm typecheck
pnpm lint
pnpm build
```

The dedicated `SKU Engine` GitHub Actions workflow runs the characterization suite whenever SKU engine, product registration, tests, or supporting configuration changes.

## Next phase

The next implementation phase may add:

1. persisted `skuRuleProfile` with `legacy-punch`, `template`, and `manual` modes;
2. persisted logical combination keys;
3. configurable maximum combinations;
4. generic template rules and normalization settings;
5. preview and apply endpoints/components;
6. reconciliation reports for preserved, added, changed, and removed variants;
7. a committed Payload delta migration, generated types, and generated import map.

No pull request from this phase should be merged without explicit approval.
