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

## Optional dedicated signing secrets

- `PROTECTED_DOWNLOAD_SECRET`
- `UNSUBSCRIBE_SECRET`

When these values are absent, their token signing falls back to `PAYLOAD_SECRET`. Dedicated values are recommended in production because they allow one token family to be rotated without invalidating Payload sessions.

## Coolify checklist

1. Define all production values as runtime secrets or environment variables in Coolify.
2. Set the canonical public URL to the final HTTPS origin without a path.
3. Use a PostgreSQL internal-network URL rather than a publicly exposed database endpoint.
4. Do not paste secret values into issues, pull requests, logs, or chat messages.
5. After rotating a signing secret, expect previously issued protected-download or unsubscribe tokens to become invalid.
6. Run the release smoke-test checklist before promoting the deployment.

## Local development

Copy `.env.example` to `.env.local`, fill `PAYLOAD_SECRET` and `DATABASE_URI`, and configure Mailpit or another SMTP service. Development defaults are available for the local public URL and unauthenticated Mailpit-style SMTP only; core database and Payload secrets never receive fallbacks.
