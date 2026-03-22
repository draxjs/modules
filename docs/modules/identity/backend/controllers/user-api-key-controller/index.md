# UserApiKeyController

## Propósito

`UserApiKeyController` administra API keys de usuario con reglas propias de ownership.

## Base

- hereda de `AbstractFastifyController<IUserApiKey, IUserApiKeyBase, IUserApiKeyBase>`
- usa `UserApiKeyServiceFactory()`
- usa `UserApiKeyPermissions`

## Métodos sobrescritos

- `paginate`
  - exige autenticación
  - permite `View` o `ViewMy`
  - si no tiene `View`, agrega filtro `user = request.rbac.userId`
- `create`
  - permite `Create` o `CreateMy`
  - si no tiene `Create` o no envía `payload.user`, fuerza el usuario actual
  - setea `createdBy`
- `update`
  - exige `Update`
- `delete`
  - exige `Delete`

## Particularidad

Maneja errores manualmente y no delega al flujo estándar del controlador base en los métodos sobrescritos.
