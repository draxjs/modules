# IdentityConfig

## Propósito

`IdentityConfig` centraliza las claves de configuración que el backend de identidad espera encontrar en `DraxConfig` o en variables de entorno.

## Claves expuestas

- `JwtSecret`: `DRAX_JWT_SECRET`
- `JwtExpiration`: `DRAX_JWT_EXPIRATION`
- `JwtIssuer`: `DRAX_JWT_ISSUER`
- `ApiKeySecret`: `DRAX_APIKEY_SECRET`
- `ApiKeyCacheTTL`: `DRAX_APIKEY_CACHE_TTL`
- `RbacCacheTTL`: `DRAX_RBAC_CACHE_TTL`
- `AvatarDir`: `DRAX_AVATAR_DIR`
- `defaultRole`: `DRAX_DEFAULT_ROLE`
- `VerifyIP`: `DRAX_VERIFY_IP`

## Dónde se usa

- JWT y cambio de tenant en `AuthUtils`
- cache de API keys y RBAC en middleware
- bootstrap de configuración en `LoadIdentityConfigFromEnv`
- generación y verificación de API keys
- ubicación de avatars y rol por defecto

## Cuándo usarlo

Usalo cuando necesites referenciar configuración del dominio identidad sin hardcodear strings de entorno en varios archivos.
