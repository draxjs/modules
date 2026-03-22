# AuthUtils

## Propósito

`AuthUtils` reúne utilidades de autenticación para hashing de contraseñas, emisión y verificación de JWT, HMAC de API keys y cambio de tenant en tokens.

## Métodos

- `verifyToken(token)`
  - lee `IdentityConfig.JwtSecret`
  - verifica HS256
  - valida el payload con `TokenPayloadSchema`
- `hashPassword(password)`
  - usa `bcryptjs.genSaltSync(10)` y `hashSync`
- `checkPassword(password, hashPassword)`
  - compara con `bcryptjs.compareSync`
- `generateToken(payload)`
  - valida el payload
  - usa `JwtSecret`, `JwtExpiration` y `JwtIssuer`
  - firma HS256
- `generateHMAC(secret, apikey)`
  - calcula SHA-256 HMAC y devuelve hex
- `switchTenant(accessToken, newTenantId, tenantName)`
  - verifica el token actual
  - cambia `tenantId` y `tenantName`
  - vuelve a firmar

## Dónde se usa

- `jwtMiddleware`
- `UserService`
- `UserApiKeyService`

## Particularidades

- `switchTenant` vuelve a firmar el payload, pero no reutiliza `expiresIn`, `issuer` ni el resto de opciones de `generateToken`.
- `verifyToken` y `generateToken` fallan si falta `DRAX_JWT_SECRET`.

## Cuándo usarlo

Usalo cuando la lógica de identidad necesite operar con contraseñas, JWT o HMACs sin repetir código criptográfico.
