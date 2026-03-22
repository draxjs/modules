# Config

## Propósito

`config` define las variables de entorno específicas del módulo de identidad.

## Piezas principales

- `IdentityConfig.JwtSecret`, `JwtExpiration`, `JwtIssuer`: controlan firma y vigencia del JWT.
- `ApiKeySecret`, `ApiKeyCacheTTL`: gobiernan API keys y cache asociada.
- `RbacCacheTTL`: TTL de cache para evaluaciones de permisos.
- `AvatarDir`: directorio de almacenamiento de avatares.
- `defaultRole`: rol asignado en registros por defecto.
- `VerifyIP`: flag para validaciones ligadas a IP.

## Cuándo usarlo

Conviene cuando inicializás el módulo o necesitás leer parámetros de seguridad y persistencia sin hardcodearlos.
