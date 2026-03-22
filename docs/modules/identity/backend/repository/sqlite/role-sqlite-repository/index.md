# RoleSqliteRepository

## Propósito

`RoleSqliteRepository` implementa `IRoleRepository` sobre `AbstractSqliteRepository`.

## Configuración

- `tableName = 'roles'`
- `identifier = '_id'`

## Overrides

- `prepareData`
  - serializa `permissions` y `childRoles`
- `prepareItem`
  - parsea esos campos y resuelve `childRoles`
- `findByName`
- `findWithoutPopulateById`
