# Echo Web

[简体中文](README.zh_CN.md)

Vue 3 web frontend for Echo. It contains the public product landing page,
privacy policy and terms, plus the authenticated administration console for
reports, user feedback, maintenance policy, and notification broadcasts.

## Routes

- `/` — public Echo landing page.
- `/terms` and `/privacy` — public legal documents.
- `/admin/login` — server-verified administrator email-link login.
- `/admin/reports`, `/admin/feedback`, and `/admin/app-operations` —
  administrator-only tools.

The router only treats a server session whose user role is `ADMIN` as an
administrator. API errors, refresh-token rotation, request cancellation, and
trace IDs are handled by the shared client in `src/server/axios`.

## Local development

Requirements: Node.js `>= 24.14.0` and the pnpm version declared by
`packageManager`.

```zsh
pnpm install
pnpm start
```

Environment files provide `VITE_APP_BASE_URL`, `VITE_APP_BASE_API`, site
metadata, and optional brand/store URLs. Secrets and server credentials do not
belong in this repository. Brand assets default to Echo's public media origin.

## Project structure

```text
src/
  assets/styles/   # global CSS, Tailwind tokens, Vuetify layers
  components/      # shared runtime components
  router/          # public and administrator routes
  server/          # API modules, models, and the shared axios client
  store/           # persisted locale/theme/session state and snackbar state
  views/Main/      # landing page and legal pages
  views/Admin/     # administrator login and console pages
```

Global colors and repeated visual values belong in
`src/assets/styles/css/tailwind/tokens.css`. Page styles should consume those
tokens or Vuetify semantics instead of introducing a parallel theme.

## Verification

Run the complete read-only quality gate before handoff:

```zsh
pnpm quality
git diff --check
```

`pnpm quality` checks formatting, zero-warning lint, TypeScript/Vue types,
source-size and style-token architecture guards, and the production build.
