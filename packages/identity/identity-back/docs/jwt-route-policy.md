# JWT middleware: route policy

Register `jwtMiddleware` as a Fastify `onRequest` hook. Consumers can explicitly choose how it treats `Authorization: Bearer …` for each route using Fastify route `config`:

```ts
import Fastify from 'fastify';
import {jwtMiddleware} from '@drax/identity-back';

const app = Fastify();
app.addHook('onRequest', jwtMiddleware);

app.get('/public-content', {
    config: {identityJwt: 'optional'},
}, async () => ({message: 'Public content'}));

app.post('/api/auth/external/exchange', {
    config: {identityJwt: 'ignore'},
}, async (request, reply) => {
    // Application-provided verifier: validate signature, issuer, audience, expiry,
    // and any other requirements of the independent authentication mechanism.
    const principal = await verifyExternalCredential(request.headers.authorization);
    if (!principal) return reply.code(401).send({error: 'Invalid external credential'});
    return exchangePrincipalForLocalSession(principal);
});
```

`verifyExternalCredential` and `exchangePrincipalForLocalSession` above are consumer-owned functions, not exports from this package. No provider-specific route or credential format is built into this policy.

## API contract

| `config.identityJwt` | No Bearer | Valid Drax Bearer | Invalid/expired Bearer |
| --- | --- | --- | --- |
| omitted or `'optional'` | Continue without JWT identity | Set `request.authUser` and `request.token` | Reject: 401 invalid / 498 expired |
| `'ignore'` | Continue | Continue without decoding or assigning JWT identity | Continue; the route's own mechanism must validate its credential |

The union `'optional' | 'ignore'` is declared on Fastify's `FastifyContextConfig` and included in the package declarations when importing `jwtMiddleware` (including from the package entry point). Only the exact value `'ignore'` opts out; unknown runtime values keep the default behavior.

- **Public does not mean ignore.** An optional public route still rejects an invalid supplied Drax JWT. Use `ignore` explicitly when Bearer belongs to another mechanism, or when a route deliberately must not consume a JWT.
- `ignore` leaves the Authorization header untouched. It neither validates external credentials nor grants access nor creates a Drax identity. It does not clear identity supplied by another hook, disable API-key middleware, or bypass RBAC/controller checks.
- Protected routes must retain their existing authentication/authorization checks. `jwtMiddleware` itself has never required a token: absence of a Bearer continues to the next hook. Do not set `ignore` on a JWT-protected route expecting that route to receive JWT identity.
- The setting is read from the matched route's `request.routeOptions.config`, so parameters and query strings do not require URL exclusions. Other routes retain their default behavior; there is no wildcard/prefix exclusion or global fail-open switch.
- For backwards compatibility, the existing exact pathname exclusions `/api/auth/login`, `/api/auth/refresh`, and `/api/auth/logout` still ignore Bearer (also with query strings), even with `optional`. No other routes are automatically excluded. This change does not alter existing route declarations.

## Demonstrated flow and tests

`test/security/jwt-middleware.test.ts` uses real Fastify routing and `inject`, the actual middleware and real HS256 verification (no JWT verification mock, no database):

1. Default public route: anonymous succeeds; malformed Bearer returns Drax 401.
2. Explicit optional route: valid JWT populates identity; anonymous succeeds; malformed JWT fails.
3. Explicit ignore route with a path parameter and query string: absent, malformed, expired and valid Bearers all proceed without JWT identity.
4. External exchange fixture: middleware ignores Bearer; the independent route verifier is reached and returns its own 401 for an invalid external credential. An accepted fixture credential proceeds without Drax identity. This is a test verifier, not an integration with an external provider.
5. Protected fixture retains its independent authentication guard: missing/invalid JWT fails, valid JWT succeeds, expired JWT returns exactly the 498 error body before the handler runs.
6. Legacy login/refresh/logout exclusions still accept an expired Bearer.

Run from `packages/identity/identity-back`:

```sh
npx vitest run test/security/jwt-middleware.test.ts
npm run tsc
```
