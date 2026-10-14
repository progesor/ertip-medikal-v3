# Security dependency upgrade — 2026-10-14

Based on `origin/main` at `d6650de2a`. The existing development checkout has
uncommitted changes and was left untouched. Work is isolated on
`codex/security-upgrade-october`.

## Version selection

| Component | Previous | Updated |
| --- | --- | --- |
| Next.js / eslint-config-next | 16.2.11 | 16.3.8 |
| All six Payload packages | 3.86.0 | 3.90.2 |
| React / React DOM | 19.2.8 | 19.2.8 (retained) |
| Sharp | 0.35.3 | 0.35.5 |
| PostCSS (including transitive copies) | 8.5.18 override | 8.5.30 |
| Node.js | broad 22–24 range | 24.21.0 recommended; 22.23.3+ also allowed |
| pnpm | CI 10, local 11.21.0 | 10.34.7 pinned |

Next 16.3.8 contains the September security fixes and satisfies Payload's
Next peer range. New feature releases Next 16.4 / React 19.3, Payload 4 canaries,
Tailwind 4, and database major upgrades are deliberately outside this change.
Node 23 is no longer accepted. `.node-version` and CI select Node 24.21.0.

Sources: [Next September release](https://nextjs.org/blog/september-2026-security-release),
[Payload 3.90 upgrade notes](https://github.com/payloadcms/payload/releases/tag/v3.90.0),
[Payload 3.90.2](https://github.com/payloadcms/payload/releases/tag/v3.90.2),
[Node 24.21.0](https://nodejs.org/en/blog/release/v24.21.0).

## Dependency policy and remaining finding

The original full audit reported 91 advisory records (7 critical, 43 high,
35 moderate, 6 low). These are dependency records, not 91 confirmed reachable
application vulnerabilities. After the upgrade, the production audit reports
zero known advisories. The full audit retains one high development-tool finding:
[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm),
`braces@3.0.3`, through ESLint/Tailwind glob processing. As of this review there
is no patched upstream release. No advisory is ignored and the production
audit threshold remains LOW. Do not feed untrusted glob patterns to build or
lint tools; recheck the full audit when upstream publishes a fix. This is not
a claim that the entire dependency tree is vulnerability-free.

Security overrides now live in `pnpm-workspace.yaml`; pnpm 11 ignored their old
`package.json` location. `packageManager`, the pnpm engine and all workflows
pin 10.34.7. DOMPurify, fast-uri, js-yaml, markdown-it, PostCSS, Sharp, esbuild,
ws and selector parsing use patched versions. Scoped overrides upgrade
Payload's Undici to 7.29.1 and Nodemailer to 10.1.1. Nodemailer's major override
is necessary for the published fixes and was tested through the actual Payload
adapter against local Mailpit, including plain text and HTML delivery.

Payload's old Sass pin used Chokidar 3 and introduced `braces` into production
dependencies. Sass is overridden to 1.105.1; its Immutable 5 dependency is not
forced down to Immutable 4. `tailwindcss-animate` is now a dev dependency because
its only import is in `tailwind.config.ts`. Build stages must install dev
dependencies; prune them only after building. No arbitrary replacement package
or homegrown patch was substituted for `braces`.

## Migration and compatibility fixes

`20261014_063557_security_auth_fields` adds the nullable timestamp column
`users.reset_password_requested_at` required by Payload's password-reset
throttling. It does not drop or rewrite business data. Generated Payload types
and the migration snapshot are included; the admin import map has no semantic
change. QuoteRequests, DownloadLogs and the catalog/cart route architecture
remain unchanged.

The locale switcher now uses the server pathname during hydration, then follows
the browser pathname for client navigation. This prevents an anchor/span
mismatch on rewritten locale routes. A browser regression test checks both
languages for client errors. The website layout resolves request headers before
initializing Payload, preventing speculative build-time database connections.

## Verification

- Frozen lockfile installation; no peer dependency conflicts reported.
- Production dependency audit: zero known advisories; full audit: one high
  development finding documented above.
- Payload type and import-map generation, TypeScript and ESLint pass.
- SKU: 25 tests; RFQ: 6 tests; locale bootstrap: 2 tests pass.
- Chromium mobile E2E: 11 tests pass, including the new hydration regression.
- All committed migrations apply to a disposable PostgreSQL 17 instance;
  generating a subsequent migration with `--skip-empty` produces no schema drift.
- Production build succeeds with an intentionally unreachable database URI,
  without a database connection error after the layout fix.
- Production smoke: Turkish/English catalog, quote cart and authenticated
  Payload admin return HTTP 200 without browser errors; changing a test user's
  password invalidates an earlier session.
- Payload email adapter delivers to disposable Mailpit; Sharp successfully
  encodes and decodes JPEG, WebP and AVIF.

No tests use production credentials, production data or external mail delivery.
Local PostgreSQL and the live Coolify deployment were not modified.

## Local and Coolify rollout

1. Use Node 24.21.0 and pnpm 10.34.7. The existing machine's Node 24.18.0 is
   below the new minimum; update the development runtime before installing this
   branch. Do not copy the old checkout's modified lockfile over this one.
2. In Coolify/Railpack, ensure both build and runtime select Node 24.21.0 and
   honor `packageManager`. A server-level version override can take precedence
   over repository declarations; verify the deployment logs.
3. Install with `pnpm install --frozen-lockfile` (including dev dependencies).
   Keep build command `pnpm build:deploy` and start command `pnpm start`.
   The build does not migrate. Startup applies migrations before serving traffic.
4. Before merging into the auto-deployed `main`, verify the PR checks and take
   the database/media backup required by the existing production release checklist.
5. After deployment, verify migration status and admin login, public catalog,
   language switching, quote submission, protected downloads and real SMTP.
   An old password hash is upgraded by Payload on successful login; password
   changes revoke earlier sessions.
6. If an application rollback is needed, restore the previous application
   revision while retaining the additive nullable column. Do not run a database
   reset or a destructive migration rollback against production.

The Coolify host's Node version, PostgreSQL patch level, image packages and
actual production SMTP delivery require server-side verification; a repository
dependency audit does not inspect those components.
