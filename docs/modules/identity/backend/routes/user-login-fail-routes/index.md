# UserLoginFailRoutes

## Propósito

`UserLoginFailRoutes` registra lectura, group-by y export de intentos fallidos de login.

## Qué registra

- `GET /api/user-login-fails`
- `GET /api/user-login-fails/group-by`
- `GET /api/user-login-fails/export`

## Documentación

Usa `CrudSchemaBuilder(UserLoginFailSchema, UserLoginFailBaseSchema, UserLoginFailBaseSchema, 'UserLoginFail', 'openapi-3.0', ['Identity'])`.
