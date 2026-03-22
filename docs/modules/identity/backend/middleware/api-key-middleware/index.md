# apiKeyMiddleware

## Propósito

`apiKeyMiddleware` carga una API key desde el request, la resuelve a usuario autenticado y opcionalmente valida IP.

## Dónde busca la key

- header `x-api-key`
- `Authorization: ApiKey <uuid>`
- `Authorization: <uuid>`

## Flujo

1. resuelve la key
2. usa `DraxCache<IUserApiKey>` con TTL `DRAX_APIKEY_CACHE_TTL`
3. carga la API key mediante `UserApiKeyServiceFactory().findBySecret`
4. si `VerifyIP` está activo, verifica `ipv4` o `ipv6`
5. si hay usuario asociado, construye `request.authUser`

## Payload que arma

`request.authUser` contiene:

- `id`
- `username`
- `roleId`
- `roleName`
- `tenantId`
- `tenantName`
- `apiKeyId`
- `apiKeyName`

## Cuándo usarlo

Usalo cuando el backend de identidad debe aceptar autenticación por API key además de JWT.
