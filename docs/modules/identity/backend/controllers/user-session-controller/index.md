# UserSessionController

## Propósito

`UserSessionController` expone lectura, exportación y group-by de sesiones de usuario, bloqueando mutaciones manuales.

## Base

- hereda de `AbstractFastifyController<IUserSession, IUserSessionBase, IUserSessionBase>`
- usa `UserSessionServiceFactory()`
- usa `UserSessionPermissions`

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

Todas responden con `MethodNotAllowedError`.
