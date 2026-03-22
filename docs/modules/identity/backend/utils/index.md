# Utils

## Propósito

`utils` expone herramientas criptográficas y JWT usadas por el resto del módulo.

## Piezas principales

- `AuthUtils.verifyToken(token)`: valida JWT y parsea el payload.
- `AuthUtils.generateToken(payload)`: firma access tokens.
- `AuthUtils.hashPassword(password)` y `checkPassword(password, hash)`: hashing y validación con `bcryptjs`.
- `AuthUtils.generateHMAC(secret, apiKey)`: calcula el hash de API keys.
- `AuthUtils.switchTenant(accessToken, tenantId, tenantName)`: emite un nuevo token con el tenant activo actualizado.

## Cuándo usarlo

Usalo en servicios y middleware cuando necesites operaciones de autenticación reutilizables y consistentes.
