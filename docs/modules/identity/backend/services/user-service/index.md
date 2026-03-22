# UserService

## Propósito

`UserService` concentra la lógica principal de autenticación y gestión de usuarios.

## Operaciones de autenticación

- `auth(username, password, { userAgent, ip })`
  - busca usuario con password
  - valida `active`
  - compara password con `AuthUtils.checkPassword`
  - genera sesión
  - genera JWT
  - registra `UserLoginFail` si falla
- `authByEmail(email, createIfNotFound, userData, ctx)`
  - autentica por email
  - opcionalmente crea el usuario si no existe
- `switchTenant(accessToken, tenantId, tenantName)`
  - delega en `AuthUtils.switchTenant`

## Operaciones de usuario

- `changeUserPassword`
- `changeOwnPassword`
- `changeAvatar`
- `recoveryCode`
- `changeUserPasswordByCode`
- `register`
- `verifyEmail`
- `verifyPhone`
- `create`
- `update`
- `delete`
- `findById`
- `findByUsername`
- `findByUsernameWithPassword`
- `findByEmail`
- `paginate`
- `search`

## Particularidades

- genera sesiones con `UserSessionServiceFactory`
- hashea passwords antes de persistir
- usa `SecuritySensitiveError` en recuperación para no filtrar si el email existe
- elimina `password` del objeto devuelto en varios flows
