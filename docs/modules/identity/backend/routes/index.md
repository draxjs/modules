# Routes

## Propósito

La carpeta registra las rutas Fastify del módulo y las vincula con controladores y schemas OpenAPI.

## Piezas principales

- `UserRoutes`
- `RoleRoutes`
- `TenantRoutes`
- `UserApiKeyRoutes`
- `UserSessionRoutes`
- `UserLoginFailRoutes`

Estas funciones suelen crear el controlador, asociar middleware y construir documentación con `CrudSchemaBuilder`.

## Cuándo usarlo

Usalo al montar el backend para dejar publicado el dominio identidad por REST.
