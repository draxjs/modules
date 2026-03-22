# AuditCrudRoute

## Propósito

`AuditCrudRoute` declara las rutas Vue Router listas para integrar el módulo.

## Rutas

- `/crud/audit` -> `AuditCrudPage`
- `/crud/audit-ds` -> `AuditCrudDashboardPage`

## Seguridad

Ambas rutas exigen:

- `meta.auth = true`
- `meta.permission = 'audit:manage'`
