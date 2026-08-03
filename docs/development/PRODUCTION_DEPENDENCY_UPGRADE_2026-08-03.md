# Production Dependency Security Upgrade — 2026-08-03

This change keeps the application on the current major architecture while moving security-sensitive runtime dependencies to supported releases before the public production launch.

## Runtime baseline

- Node.js: supported LTS lines only; CI validates Node 24 LTS.
- Next.js: `16.2.11` Active LTS.
- Payload CMS: `3.86.0` stable across all Payload packages.
- Sharp: `0.35.3` stable.
- pnpm: major `10` in CI.

## Compatibility policy

No framework major migration is included. PostgreSQL schema is unchanged by the dependency upgrade itself. The existing committed Payload migration chain remains canonical and must continue to pass schema-drift and production-build validation.

## Required validation

The dependency branch is release-ready only when the final non-bot head passes:

- Payload generated type consistency;
- Payload admin import-map consistency;
- TypeScript and ESLint;
- committed migration application and status;
- production migration baseline adoption simulation;
- schema-drift detection;
- production Next.js build;
- SKU characterization tests;
- RFQ validation tests;
- Chromium browser E2E.

Coolify should run a supported LTS runtime from the range declared in `package.json`; Node 24 is preferred for the public release so production matches CI.
