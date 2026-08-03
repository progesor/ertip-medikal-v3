# Environment and Secret Policy

The application validates its server environment when Payload configuration is loaded. Invalid or missing required values stop startup and production builds instead of falling back to insecure defaults.

## Required in every environment

- `PAYLOAD_SECRET`: unique, non-placeholder value with at least 32 characters.
- `DATABASE_URI`: absolute PostgreSQL connection URL using `postgres:` or `postgresql:`.

## Required in production

- `NEXT_PUBLIC_SITE_URL` or `NEXT_PUBLIC_SERVER_URL`: canonical public `http`/`https` origin.
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_FROM_NAME`
- `SMTP_FROM_ADDRESS`

`SMTP_USER` and `SMTP_PASS` are optional only when the SMTP server does not require authentication. They must be configured together.

## Recommended dedicated signing secrets

- `PROTECTED_DOWNLOAD_SECRET`
- `UNSUBSCRIBE_SECRET`

When these values are absent, their token signing falls back to `PAYLOAD_SECRET`. Dedicated values are strongly recommended in production because they allow one token family to be rotated without invalidating Payload sessions. Use independently generated values of at least 32 random characters and do not reuse either value for another service.

## First administrator bootstrap

Anonymous first-user creation is disabled automatically when `NODE_ENV=production`.

A fresh production database must therefore create its initial administrator in a controlled deployment window. If the Payload admin UI must be used for that one-time bootstrap, temporarily set:

```text
ALLOW_PUBLIC_ADMIN_BOOTSTRAP=true
```

Then:

1. keep the application reachable only through a private/staging hostname, VPN, IP allow-list or maintenance gate;
2. create the first administrator immediately;
3. remove `ALLOW_PUBLIC_ADMIN_BOOTSTRAP` from Coolify;
4. redeploy/restart the application;
5. confirm anonymous user creation is no longer available before exposing the final public hostname.

Never leave `ALLOW_PUBLIC_ADMIN_BOOTSTRAP=true` configured on a public production deployment. Existing installations that already have an administrator do not need this variable.

## Coolify checklist

1. Define all production values as runtime secrets or environment variables in Coolify.
2. Set the canonical public URL to the final HTTPS origin without a path.
3. Use a PostgreSQL internal-network URL rather than a publicly exposed database endpoint.
4. Use a supported Node.js LTS runtime from the versions allowed by `package.json`.
5. Configure dedicated `PROTECTED_DOWNLOAD_SECRET` and `UNSUBSCRIBE_SECRET` values before public launch.
6. Keep `ALLOW_PUBLIC_ADMIN_BOOTSTRAP` absent after the first administrator exists.
7. Do not paste secret values into issues, pull requests, logs, or chat messages.
8. After rotating a signing secret, expect previously issued protected-download or unsubscribe tokens to become invalid.
9. Run the release smoke-test checklist before promoting the deployment.

## Local development

Copy `.env.example` to `.env.local`, fill `PAYLOAD_SECRET` and `DATABASE_URI`, and configure Mailpit or another SMTP service. Development defaults are available for the local public URL and unauthenticated Mailpit-style SMTP only; core database and Payload secrets never receive fallbacks.
