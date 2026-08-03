# Production Release Gate Clean Rebuild — 2026-08-03

This final release-gate package was rebuilt from canonical `main` after the dependency-security and auth/API hardening packages were squash-merged.

Only the release-gate scope is included: dependency monitoring and audit, CodeQL analysis, patched transitive dependency overrides, product Markdown sanitization, security regression browser coverage and the public-production checklist.

The package must pass the complete CI, production build and migration checks, Browser E2E, RFQ Validation, SKU Engine, Dependency Security Audit and CodeQL before merge approval.
