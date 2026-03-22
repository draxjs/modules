# RoleRoutes

## Propósito

`RoleRoutes` registra las rutas HTTP de roles sobre Fastify.

## Qué registra

- `GET /api/roles/search`
- `GET /api/roles/:id`
- `GET /api/roles/all`
- `GET /api/roles`
- `POST /api/roles`
- `PUT /api/roles/:id`
- `DELETE /api/roles/:id`
- `GET /api/roles/export`
- `GET /api/permissions`
- `GET /api/roles/name/:name`

## Documentación

Usa `CrudSchemaBuilder(RoleSchema, RoleBaseSchema, RoleBaseSchema, 'role', 'openapi-3.0', ['Identity'])`.
