# Payload Admin Hydration Compatibility

The Payload Admin Panel runs inside the Next.js App Router and must keep its React runtime aligned with the supported Next.js 16 line.

## Runtime versions

The repository pins:

```text
react: 19.2.8
react-dom: 19.2.8
```

The previous project bootstrap used a May 2024 React 19 release candidate. That prerelease runtime predates stable React 19 and the React 19.2 SSR/hydration behavior used by Next.js 16.

React and ReactDOM must always use the exact same version. The corresponding `@types/react` and `@types/react-dom` packages must remain on their stable React 19 lines.

## Custom admin components

Custom Payload admin components must produce the same attributes during server rendering and the first client render.

The image-optimization action therefore:

- starts enabled on both the server and client;
- disables only while an optimization run is active;
- loads status asynchronously without changing the initial `disabled` attribute;
- avoids dates, random values and browser-only branches in rendered initial markup.

Random run IDs are created only after a user click and do not participate in server rendering.

## Import map

Run:

```bash
pnpm payload:importmap
```

The command is automatically executed by `predev` and `prebuild`. CI regenerates the import map and rejects committed drift.

## Local verification

After dependency or admin-component changes:

```bash
pnpm install
pnpm clean
pnpm payload:types
pnpm payload:importmap
pnpm typecheck
pnpm lint
pnpm dev
```

Open `/admin/globals/imageOptimization` in a fresh browser tab and confirm:

- the optimizer panel renders;
- the action button is enabled before a run and disabled only during a run;
- no hydration mismatch is logged;
- the standard Payload fields remain editable for an administrator.

Do not use `admin.suppressHydrationWarning` to hide a reproducible nested mismatch. Fix the server/client markup or dependency alignment instead.
