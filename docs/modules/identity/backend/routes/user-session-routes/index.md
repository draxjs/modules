# UserSessionRoutes

## Propósito

`UserSessionRoutes` registra lectura, group-by y export de sesiones de usuario.

## Qué registra

- `GET /api/user-sessions`
- `GET /api/user-sessions/group-by`
- `GET /api/user-sessions/export`

## Documentación

Usa `CrudSchemaBuilder(UserSessionSchema, UserSessionBaseSchema, UserSessionBaseSchema, 'UserSession', 'openapi-3.0', ['Identity'])`.
