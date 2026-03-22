# DashboardCrudRoute

## Propósito

`DashboardCrudRoute` declara las rutas Vue Router del módulo.

## Rutas

- `/crud/dashboard` -> `DashboardCrudPage`
- `/dashboard/view` -> `DashboardViewPage`
- `/dashboard/config/:identifier` -> `DashboardConfigPage`
- `/dashboard/view/:identifier` -> `DashboardIdentifierPage`

## Seguridad

Todas requieren:

- `meta.auth = true`
- `meta.permission = 'dashboard:manage'`
