# Public Production Release Checklist

Use this checklist immediately before exposing the final public hostname. A release is not approved while any **Required** item is unresolved.

## 1. Runtime and build — Required

- [ ] Coolify runtime uses a Node.js LTS version allowed by `package.json` (Node 24 preferred; Node 22 supported).
- [ ] Build command is `pnpm build:deploy`.
- [ ] Start command is `pnpm start`.
- [ ] Latest `main` CI, Browser E2E, RFQ Validation, SKU Engine, Dependency Security Audit and CodeQL checks are green.
- [ ] `pnpm security:audit` reports no HIGH or CRITICAL production dependency advisory.
- [ ] `pnpm db:migrate:status` reports no pending migration after deployment.

## 2. Database recovery — Required

- [ ] Take a full PostgreSQL backup immediately before the public release.
- [ ] Record the backup timestamp and storage location outside the application container.
- [ ] Verify that the backup can be restored to a disposable PostgreSQL instance and that Payload starts against the restored database.
- [ ] Do not run `migrate:down`, `migrate:reset`, `migrate:refresh` or `migrate:fresh` against production.

## 3. Secrets and administrator access — Required

- [ ] `PAYLOAD_SECRET` is a unique random value of at least 32 characters.
- [ ] Configure a dedicated `PROTECTED_DOWNLOAD_SECRET`.
- [ ] Configure a dedicated `UNSUBSCRIBE_SECRET`.
- [ ] `ALLOW_PUBLIC_ADMIN_BOOTSTRAP` is absent / false.
- [ ] At least one known administrator can sign in before public DNS is switched.
- [ ] Admin login locks after repeated failed attempts and unlock behavior is verified.
- [ ] No secret value appears in repository files, Coolify build logs, issues or support notes.

## 4. Network and proxy — Required

- [ ] Public site is HTTPS-only with a valid certificate.
- [ ] `NEXT_PUBLIC_SITE_URL` (or `NEXT_PUBLIC_SERVER_URL`) equals the final HTTPS origin.
- [ ] PostgreSQL is reachable only over the internal/private network and is not published directly to the internet.
- [ ] Coolify/Traefik overwrites or appends trusted client-IP headers; verify rate-limit logs show the real client IP rather than a proxy address.
- [ ] Response headers include CSP, HSTS, `X-Content-Type-Options`, frame protection, referrer policy and permissions policy.
- [ ] `/graphql` is unavailable because the application does not use the public GraphQL API.

## 5. Persistent files — Required

- [ ] The application `media` directory is mounted to persistent storage.
- [ ] Upload a disposable image, redeploy the application, and confirm the file remains available.
- [ ] Persistent media is included in backup policy.
- [ ] `media/optimized` may be regenerated, but original uploads must be backed up.

## 6. Public abuse boundaries — Required

Test from a logged-out browser:

- [ ] Contact form accepts a valid submission and rejects invalid input.
- [ ] Newsletter subscribe/unsubscribe flow works without exposing whether an arbitrary email is subscribed.
- [ ] RFQ resolves product and variant data server-side and rejects stale/inactive variants.
- [ ] Repeated invalid requests receive HTTP 429 after the configured threshold.
- [ ] Protected document access rejects an invalid code.
- [ ] A valid protected code returns a short-lived signed download URL.
- [ ] The protected code is not present in the browser URL/history.
- [ ] New download logs contain an HMAC fingerprint, not the real access code.
- [ ] Historical download-log access-code values have been redacted by the production migration.

## 7. Upload and content security — Required

- [ ] SVG upload is rejected.
- [ ] Unsupported MIME types are rejected.
- [ ] Oversized uploads are rejected at the application/proxy boundary.
- [ ] Product Markdown permits expected headings, tables, lists and links.
- [ ] Script tags, event-handler attributes and `javascript:` URLs entered into product Markdown do not execute on the public product page.

## 8. Core smoke test — Required

Check desktop and mobile:

- [ ] `/`
- [ ] `/urunler`
- [ ] at least three `/urunler/[slug]` pages, including a variant-heavy product
- [ ] `/teklif-sepeti`
- [ ] `/haberler/[slug]`
- [ ] `/abonelikten-ayril`
- [ ] at least two CMS `/[slug]` pages
- [ ] mobile navigation, search, cart and CTA
- [ ] Payload Admin: users, products, pages, quote requests, download logs, media and image optimization

## 9. Image pipeline — Required

- [ ] Run incremental image optimization and confirm zero unexplained errors.
- [ ] Public images are served through `/api/image-delivery` when optimized derivatives exist.
- [ ] Newly changed media falls back to the original safely until optimized.
- [ ] Protected media cannot be fetched through image delivery.

## 10. Release observation — Required

For the first public release, watch Coolify/application logs during and after DNS cutover.

- [ ] No repeated Payload, PostgreSQL, Sharp, image-delivery or SMTP exceptions.
- [ ] Contact and RFQ records arrive in Payload.
- [ ] SMTP notifications are delivered.
- [ ] Database and media storage usage remain normal.

If a required check fails, keep the current public site / maintenance gate in place, preserve logs, and fix forward before reopening traffic.
