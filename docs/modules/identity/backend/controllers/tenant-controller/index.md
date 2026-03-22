# TenantController

## Propósito

`TenantController` expone CRUD de tenants y redefine el acceso al listado completo.

## Base

- hereda de `AbstractFastifyController<ITenant, ITenantBase, ITenantBase>`
- usa `TenantServiceFactory()`
- usa `TenantPermissions`

## Método específico

- `all`
  - exige permiso `View`
  - trae todos los tenants
  - si el usuario actual tiene `tenantId` y no posee `UserPermissions.SwitchTenant`, devuelve solo su tenant actual

## Cuándo usarlo

Conviene cuando el backend necesita restringir la visibilidad de tenants para usuarios sin permiso de switch.
