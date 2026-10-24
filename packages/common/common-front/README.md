# common-front

## REST request authentication contract

All five `HttpRestClient` methods (`get`, `post`, `put`, `patch`, `delete`) accept the existing `IHttpOptions.removeHeaders` option. No separate skip-auth/skip-refresh flag is needed:

```ts
await client.post('/api/auth/refresh', {refreshToken}, {
    removeHeaders: ['Authorization'],
})
```

- Header removal is case-insensitive and applies after merging base headers and request headers. All casing variants of a removed name are omitted.
- Removing `Authorization` also skips the entire `setBeforeRequest` hook for that request. This is the explicit contract for session-independent requests; do not place mandatory unrelated middleware in this optional hook.
- Removing another header (for example `content-type` for `FormData`) does **not** skip the hook.
- Neither `baseHeaders` nor the supplied options/headers are mutated by removal. Concurrent authenticated requests retain their credentials.
- Otherwise, the hook is awaited before copying headers, so a renewed JWT is used by the original request. A hook rejection prevents fetch and is propagated unchanged.
- `setBeforeRequest(handler: (url: string) => Promise<void>)` stays unchanged. It receives the original relative URL; request timeout starts after the hook completes.
- This is the application authentication preflight, **not** the browser's CORS OPTIONS preflight. JSON content types or other headers can still require CORS preflight.

Contract tests: `test/http-rest-client.test.ts` (Vitest).
