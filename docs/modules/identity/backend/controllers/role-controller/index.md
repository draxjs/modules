# RoleController

## Propósito

`RoleController` expone endpoints CRUD de roles sobre `AbstractFastifyController` y agrega operaciones específicas.

## Base

- hereda de `AbstractFastifyController<IRole, IRoleBase, IRoleBase>`
- usa `RoleServiceFactory()`
- usa `RolePermissions`

## Métodos específicos

- `findByName`
  - exige `RolePermissions.View`
  - busca por nombre
  - lanza `NotFoundError` si no existe
- `all`
  - exige `RolePermissions.View`
  - trae todos los roles
  - si el RBAC actual tiene `childRoles`, filtra solo a esos hijos
- `permissions`
  - exige `RolePermissions.Permissions`
  - devuelve `PermissionService.getPermissions()`

## Cuándo usarlo

Usalo cuando necesites exponer administración y consulta de roles, incluyendo listado acotado por jerarquía de roles hija.
