# Optional remember-me authentication

Disabled by default. Enable explicitly in the backend environment:

```dotenv
DRAX_REMEMBER_ME_ENABLED=true
# Absolute refresh lifetime in seconds (default: 30 days).
DRAX_REFRESH_TOKEN_TTL_SECONDS=2592000
```

Only the literal `true` enables the feature. Invalid/non-positive/non-integer TTLs fail closed when issuing a remembered login. JWT lifetime is unchanged (`DRAX_JWT_EXPIRATION`, normally 1 hour).

## Frontend contract

- `POST /api/auth/login`: `{username, password, rememberMe?: boolean}`.
  Normal login, opt-out, and disabled-feature login still return **exactly** `{accessToken}`.
  Only enabled + `rememberMe: true` returns `{accessToken, refreshToken, refreshExpiresAt}`.
- `POST /api/auth/refresh`: `{refreshToken}`. Returns `{accessToken, refreshToken, refreshExpiresAt}`. Replace the previous refresh token immediately; it is single-use. Expiry is ISO 8601 UTC and remains the original absolute expiry, not a sliding window.
- `POST /api/auth/logout`: `{refreshToken}`. Returns `{success: true}`, including for unknown/already-revoked tokens. Revoke the **latest** rotated token. Works even after disabling the feature.
- Malformed bodies return 400; invalid, expired, revoked, disabled or otherwise ineligible refresh attempts return the same generic 401 credentials error. Requests do not need an access token; a stale bearer header does not block these three endpoints.

Send tokens only over HTTPS. Do not log token request/response bodies. Clients must serialize refresh attempts (including across tabs), retain the latest rotated token securely, and clear local credentials on logout or rejected refresh credentials (401/403). Transient network/server failures can retain credentials for a later attempt. Do not retry a consumed token: concurrent refreshes yield one winner and one 401. A lost successful refresh response requires a new login. The backend does not set cookies; if a client introduces cookies, it must implement appropriate HttpOnly/Secure/SameSite and CSRF protections.

## Persistence and security

Private `identity_refresh_tokens` storage is separate from all user/session CRUD, with **no HTTP/GraphQL CRUD route**. Tokens are random 256-bit opaque values, stored only as SHA-256 hashes. Password fingerprints are hashes of the stored password hash, also private. Normal user/session schemas never contain either secret. Session history optionally exposes only `rememberMe` and `refreshExpiresAt` as informative login-time metadata (not proof that a token is still valid).

SQLite creates the private table idempotently on first use. Existing user/session tables are preserved; the existing session table builder adds nullable informative columns on startup. MongoDB uses a new private collection and adds optional session fields without rewriting old documents. Rotation is a conditional single SQL UPDATE or MongoDB single-document update, safe across independent backend instances; no in-process lock or replica-set transaction is required. Persistent DB storage survives process restarts. Operators may delete expired private rows/documents (`expiresAt <= current Unix milliseconds`) periodically; authorization always checks expiry regardless of physical cleanup.

Every refresh reloads the user, password, populated role and tenant from the database. Deleted/inactive users are rejected. A different password hash invalidates all previously issued refresh tokens, covering admin, own-password, recovery and direct repository password changes without altering public repository interfaces. Invalidated records are removed when presented. This does not revoke already-issued access JWTs: they expire normally. Logout likewise revokes only the supplied refresh credential, not existing access JWTs or other remembered devices.

Refresh never accepts role/tenant claims from the request or old JWT. It resets any switched tenant to the user's **current database-assigned tenant** (or null). A client that needs an authorized tenant switch must perform the existing switch flow again after refresh. No previously elevated role or tenant is carried forward.

Disabling remember-me blocks issuance and refresh but does not erase existing records. If later re-enabled, unexpired, unchanged-password tokens work again unless explicitly logged out or administratively deleted. Administrative mass revocation can delete the private collection/table contents.

## Focused tests

From the repository root, build workspace outputs first (the existing endpoint fixture imports the package entry point):

```sh
npx tsc -b packages/identity/identity-share/tsconfig.json packages/identity/identity-back/tsconfig.json
npx --no-install vitest run packages/identity/identity-back/test/services/remember-me-service.test.ts packages/identity/identity-back/test/services/remember-me-sqlite-migration.test.ts packages/identity/identity-back/test/endpoints/remember-me-route.test.ts
REMEMBER_ME_TEST_DB_ENGINE=mongo npx --no-install vitest run packages/identity/identity-back/test/services/remember-me-service.test.ts packages/identity/identity-back/test/endpoints/remember-me-route.test.ts
```

The MongoDB suite uses the existing mongodb-memory-server fixture and requires its MongoDB binary to be available/downloadable.
