# UserRoutes

## Propósito

`UserRoutes` registra tanto el CRUD de usuarios como varios endpoints de autenticación.

## Endpoints principales

- CRUD y lectura:
  - `/api/users/search`
  - `/api/users/group-by`
  - `/api/users/export`
  - `/api/users`
  - `/api/users/:id`
- Auth:
  - `/api/auth/login`
  - `/api/auth/me`
  - `/api/auth/switch-tenant`
- Registro y verificación:
  - `/api/users/register`
  - `/api/users/verify-email/:code`
  - `/api/users/verify-phone/:code`
- Password:
  - `/api/users/password/change`
  - `/api/users/password/change/:id`
  - `/api/users/password/recovery/request`
  - `/api/users/password/recovery/complete`
- Avatar:
  - `/api/users/avatar`
  - `/api/users/avatar/:filename`

## Documentación

Combina `CrudSchemaBuilder` con schemas específicos de login, register, password y switch tenant.
