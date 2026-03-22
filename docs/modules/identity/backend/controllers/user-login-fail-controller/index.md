# UserLoginFailController

## Propósito

`UserLoginFailController` expone lectura, exportación y group-by de intentos fallidos de login, pero bloquea mutaciones manuales.

## Base

- hereda de `AbstractFastifyController<IUserLoginFail, IUserLoginFailBase, IUserLoginFailBase>`
- usa `UserLoginFailServiceFactory()`
- usa `UserLoginFailPermissions`

## Configuración relevante

- `userFilter = true`
- `userSetter = true`
- `userAssert = true`
- `tenantFilter = false`
- `tenantSetter = false`
- `tenantAssert = false`

## Mutaciones bloqueadas

- `create`
- `update`
- `updatePartial`
- `delete`

Todas lanzan `MethodNotAllowedError`.

## Cuándo usarlo

Conviene cuando los intentos fallidos deben ser auditables y consultables, pero nunca editables manualmente desde la API.
