# UserController

## Propósito

`UserController` es el controlador más completo del módulo identidad. Además del CRUD de usuarios, implementa login, `me`, cambio de tenant, registro, verificación, recuperación de contraseña y avatars.

## Base

- hereda de `AbstractFastifyController<IUser, IUserCreate, IUserUpdate>`
- usa `UserServiceFactory()`
- usa `UserPermissions`
- activa `tenantField = 'tenant'`
- activa `tenantFilter = true`
- fija `entityName = 'User'`

## Flows especiales

- `auth`
  - autentica username/password
  - devuelve `accessToken`
  - emite evento `loggedIn`
- `me`
  - devuelve el usuario autenticado
  - elimina `password`
  - si el token tiene un tenant distinto, reemplaza `user.tenant`
- `switchTenant`
  - exige `UserPermissions.SwitchTenant`
  - genera nuevo token con otro tenant
  - emite evento `switchTenant`
- `register`
  - impide registro si ya hay usuario autenticado
  - usa `DRAX_DEFAULT_ROLE`
- `verifyEmail`
- `verifyPhone`
- `changeMyPassword`
- `changePassword`
- `passwordRecoveryRequest`
- `recoveryPasswordComplete`
- `updateAvatar`
- `getAvatar`

## Overrides sobre lecturas

- `paginate`
  - agrega filtro por tenant actual
  - elimina `password` de cada item
- `search`
  - agrega filtro por tenant actual

## Eventos

- `onUserLoggedIn`
- `onUserEvent`

Ambos publican `IDraxCrudEvent` vía `CrudEventEmitter`.
