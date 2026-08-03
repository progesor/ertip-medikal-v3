# Production Auth and API Hardening — 2026-08-03

This package tightens the public production boundary without changing the core CMS/page-builder architecture.

The final branch was rebuilt cleanly on top of the merged #24 dependency-security baseline so the auth/API hardening is validated against the exact production dependency tree rather than the original stacked history.

## Authentication

- Admin authentication is limited to five failed login attempts before a 15-minute lock.
- Authentication tokens expire after eight hours.
- Production auth cookies are secure and `SameSite=Lax`.
- Anonymous first-administrator creation is disabled in production unless the temporary `ALLOW_PUBLIC_ADMIN_BOOTSTRAP=true` flag is deliberately enabled during a private bootstrap window.

## Payload API surface

- Canonical `serverURL`, CORS and CSRF origins are bound to the configured public site origin.
- Relationship traversal is constrained with `defaultDepth: 1` and `maxDepth: 4`.
- The unused public GraphQL surface is disabled.
- Payload telemetry is disabled for production privacy.

## Media boundary

- Remote URL paste/import is disabled.
- SVG is not accepted by the Media collection.
- Allowed image, video and PDF MIME types are explicitly enumerated.
- Upload parsing has a 100 MB hard ceiling; the reverse proxy should enforce an equal or lower body-size ceiling.

## Protected documents

- Successful access-code use is logged only as an HMAC fingerprint.
- A data-only migration permanently redacts historical plaintext values in `download_logs.access_code`.
- Access codes are no longer read from URL query parameters.
- Short-lived signed download tokens and server-side product/document/media revalidation remain unchanged.

## HTTP boundary

The application emits CSP, HSTS in production, `nosniff`, frame denial, strict referrer policy and a restrictive permissions policy. The CSP intentionally retains the minimum inline/eval allowances currently needed by the Payload admin and existing dynamic UI; future hardening may replace those allowances with nonces after the public release.
