# SettingRoutes

## Propósito

`SettingRoutes` expone la API del módulo en `/api/settings`.

## Endpoints

- `GET /api/settings`
- `GET /api/settings/grouped`
- `GET /api/settings/:key`
- `PATCH /api/settings/:id`

## Rol

Todos delegan en `SettingController` y usan la tag OpenAPI `Settings`.
