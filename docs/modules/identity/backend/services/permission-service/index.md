# PermissionService

## Propósito

`PermissionService` mantiene un registro estático de permisos cargados en memoria.

## Qué expone

- `addPermission(permission)`
- `hasPermission(permission)`
- `getPermissions()`

## Cuándo usarlo

Usalo para consolidar y consultar el catálogo de permisos que luego expone `RoleController.permissions`.
