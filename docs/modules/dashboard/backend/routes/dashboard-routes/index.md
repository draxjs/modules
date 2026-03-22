# DashboardRoutes

## Propósito

`DashboardRoutes` expone la API del módulo en `/api/dashboard`.

## Endpoints

- `GET /api/dashboard`
- `GET /api/dashboard/find`
- `GET /api/dashboard/search`
- `GET /api/dashboard/:id`
- `GET /api/dashboard/find-one`
- `GET /api/dashboard/group-by`
- `POST /api/dashboard`
- `PUT /api/dashboard/:id`
- `DELETE /api/dashboard/:id`

## Detalles

- instancia `DashboardController`
- usa `CrudSchemaBuilder(DashboardSchema, DashboardBaseSchema, DashboardBaseSchema, 'Dashboard', 'openapi-3.0', ['dashboard'])`
