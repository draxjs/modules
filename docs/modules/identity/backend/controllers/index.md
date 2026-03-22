# Controllers

## Propósito

La carpeta expone la capa HTTP del módulo, principalmente sobre Fastify y apoyada en factories de servicio.

## Piezas principales

- `UserController`: login, registro, perfil, cambio de tenant, recuperación/cambio de contraseña, avatar y CRUD de usuarios.
- `RoleController`: CRUD y búsquedas de roles.
- `TenantController`: CRUD y búsquedas de tenants.
- `UserApiKeyController`: CRUD y paginación de API keys.
- `UserSessionController`: lectura y administración de sesiones.
- `UserLoginFailController`: consulta de intentos fallidos.

## Cuándo usarlo

Usalo como punto de entrada REST cuando querés registrar endpoints listos para auth y administración de identidad.
