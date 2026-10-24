# identity-front

## REST session-independent requests

`AuthRestProvider` uses the existing `IHttpOptions.removeHeaders: ['Authorization']` on:

| Provider method | Endpoint |
| --- | --- |
| `login` | `POST /api/auth/login` |
| `refresh` | `POST /api/auth/refresh` |
| `revokeSession` | `POST /api/auth/logout` |
| `registrationOptions` | `GET /api/auth/registration-options` |
| `passwordPolicy` | `GET /api/auth/password-policy` |
| `register` | `POST /api/users/register` |
| `recoveryPasswordRequest` | `POST /api/users/password/recovery/request` |
| `recoveryPasswordComplete` | `POST /api/users/password/recovery/complete` |
| `resendVerificationEmail` | `POST /api/users/verification/resend` |

With `HttpRestClient`, this removes all casing variants of Authorization **for that request only** and skips the optional authentication before-request hook. These operations must not depend on an existing access token or trigger renewal (in particular refresh must not wait on itself). Custom `IHttpClient` implementations should honor the same option contract.

`me`, `switchTenant`, `changeOwnPassword`, and `changeAvatar` still use the authenticated hook. Avatar only removes `content-type` so the browser supplies its multipart boundary.

### Actual credential flow

1. `AuthSystem` delegates to the provider. Login sends credentials without the old JWT; on success `AuthRestProvider.login` sets the returned access token in the shared client.
2. For an authenticated REST request, `HttpRestClient` awaits `setBeforeRequest` before copying base headers.
3. The session owner can call `AuthSystem.refresh(refreshToken)` from that hook. Refresh skips the hook, sends no access token, and returns rotating credentials **without committing them**.
4. The session owner must check that no logout/new login intervened, persist the result, and commit the new header via `setHttpClientToken`. The original request then copies the renewed header. Hook errors propagate unchanged and prevent the original fetch.
5. `revokeSession(refreshToken)` posts server-side revocation independently of the JWT. `logout()` is separate, synchronous local header removal; it does not call the server.

This package does not implement session persistence, refresh single-flight/locking, or refresh-response race arbitration. Those remain with the session owner. GraphQL is unchanged: `IGqlClient` does not expose `IHttpOptions`; its provider has no REST refresh/revocation implementation.

## JWT expiration API

```ts
AuthHelper.isJWTValid(accessToken: string, marginSeconds: number = 0): boolean

const needsRefresh = !AuthHelper.isJWTValid(token, 30)
// For nullable state: !AuthHelper.isJWTValid(token ?? '', 30)
```

- Default margin is **0 seconds**, preserving ordinary validity checks. Callers opt into the **30-second** refresh window with the second argument; there is no duplicate needsRefresh API.
- Valid means a structurally decodable three-segment JWT with object header/payload, finite numeric `exp`, and `exp > Date.now() / 1000 + marginSeconds`.
- Exactly at expiration, or exactly at the margin boundary, returns `false`. Numeric strings, missing/non-finite `exp`, malformed tokens and negative/non-finite margins return `false` without throwing or logging the token.
- This is a **local structure/expiration check**, not signature verification, issuer/audience validation, or server authorization. It does not enforce `nbf`.
- `identity-vue` is not changed here. Its existing `needsRefresh` calculation can be replaced with the call above; the transport now handles explicit request-local exclusions without relying on its URL allowlist.

## Validation

`npm run test:unit -- --run` runs the identity contract tests. `test/auth-rest-contract.test.ts` covers independent endpoints and nested refresh; `test/auth-helper.test.ts` covers expiration boundaries and malformed input. Shared transport contracts live in `common-front/test/http-rest-client.test.ts`.
