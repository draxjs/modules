# LoadPermissions

## Propósito

`LoadPermissions` registra un listado de permisos en `PermissionService`.

## Qué hace

Recorre el array recibido y ejecuta `PermissionService.addPermission(permission)` por cada elemento.
