# identity-front

This template should help get you started developing with Vue 3 in Vite.

## Remember-me sessions

Remember-me is disabled unless the consuming Vite app defines
`VITE_DRAX_REMEMBER_ME_ENABLED=true` (exact string). `IdentityLogin` includes the
exported `IdentityRememberMe` checkbox, localized in English/Spanish and initially
unchecked. Custom login forms can use `<IdentityRememberMe v-model="rememberMe" />`
and `useAuth().login(username, password, rememberMe)`. Ordinary logins still call
`AuthSystem.login` with only two arguments and discard any previous refresh token.

Install the persisted-state plugin on Pinia, then await `setupAuthSession()` after
installing Pinia and **before** installing the router or starting API requests.
The setup function does not require a component or router context. Enable the
backend separately with `DRAX_REMEMBER_ME_ENABLED=true`; its optional
`DRAX_REFRESH_TOKEN_TTL_SECONDS` defaults to 2592000 (30 days). Neither flag
changes the normal JWT expiration.

```ts
import {setupAuthSession} from '@drax/identity-vue'

app.use(pinia)
await setupAuthSession()
app.use(router)
```

Custom guards should await `refreshAuthSession()` before existing auth/permission
checks, catch transient maintenance errors, retain recoverable
credentials and cancel protected navigation until retry rather than treating
network failure as logout. Zuite's `router/authGuard.ts` provides the complete
example, including permission checks and login redirection. Publish/upgrade
`common-front`, `identity-front`, `identity-share` and the identity backend/Vue
packages together when enabling this feature.

Integration contracts:

- `AuthSystem.login(username, password, rememberMe?)`, `refresh(refreshToken)` and
  `revokeSession(refreshToken)` must implement the identity-front contract. Login
  and refresh return `{accessToken, refreshToken?, refreshExpiresAt?}`. Expiration
  dates are ISO strings. Front providers must not persist session data.
- The shared `HttpRestClientFactory.getInstance()` client may implement
  `setBeforeRequest(handler)`. The handler must run **before** copying authorization
  headers. Without this optional method, startup renewal works but automatic
  renewal before subsequent REST requests is unavailable.
- The hook excludes login/refresh/logout. Renewal uses a 30-second access-token
  expiry margin, single-flight per store/tab, and Web Locks plus synchronous
  `AuthStore` persistence/re-reading across tabs. Browsers without Web Locks only
  have same-tab coordination; concurrent cross-tab rotation is not guaranteed.
- Profile reload after renewal bypasses only its own `/api/auth/me` preflight to
  avoid recursion. If the profile is absent after a transient failure, subsequent
  session maintenance retries it single-flight even with a fresh JWT, without
  rotating again. Startup does not immediately repeat a failed profile request.
- `AuthStore.sessionVersion` is a persisted operation epoch changed by clearing
  auth (including login/token-login start and logout). Pending login, refresh and
  profile results check this epoch before committing, including cross-tab
  null-to-null logout. Legacy stores without the field use the initial null epoch.
  Late returned refresh credentials are revoked best-effort.
- Transient refresh/profile errors retain recoverable credentials; rejected
  credentials (HTTP 401/403, including common-front wrapped errors) clear auth.
  Logout clears local state immediately, with best-effort server revocation even
  when the feature has subsequently been disabled. Offline revocation cannot be
  guaranteed; the backend expiration/revocation policy remains authoritative.
- Normal sessions are never renewed. Remember-me renewal is REST-only, not a
  GraphQL preflight. Tokens live in localStorage via `AuthStore`; protect the app
  against XSS and do not log or expose refresh tokens.

Focused tests:

```sh
npm exec --workspace @drax/identity-vue -- vitest run test/auth-session.spec.ts test/auth-session.integration.spec.ts test/components/__tests__/IdentityLogin.spec.ts
```

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

```sh
npm run test:e2e:dev
```

This runs the end-to-end tests against the Vite development server.
It is much faster than the production build.

But it's still recommended to test the production build with `test:e2e` before deploying (e.g. in CI environments):

```sh
npm run build
npm run test:e2e
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
