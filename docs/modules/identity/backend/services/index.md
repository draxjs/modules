# Services

## Propósito

`services` concentra la lógica de negocio del dominio identidad.

## Piezas principales

- `UserService`: login, registro, generación de sesión, cambio de contraseña, avatar, recuperación por código, verificación de email/teléfono y CRUD.
- `RoleService`: creación, actualización, herencia y consulta de roles.
- `TenantService`: CRUD, búsqueda y paginación de tenants.
- `UserApiKeyService`: generación, hash y validación de secrets para API keys.
- `UserSessionService`: administración de sesiones de usuario.
- `UserLoginFailService`: registro y consulta de intentos de login fallidos.
- `PermissionService`: agregación/listado de permisos.
- `UserEmailService`: envío de emails de registro o recuperación.

## Cuándo usarlo

Usalo cuando necesites la capa de negocio de identidad desacoplada de HTTP, GraphQL y la persistencia concreta.
