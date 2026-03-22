# RoleMongoRepository

## Propósito

`RoleMongoRepository` implementa `IRoleRepository` sobre `AbstractMongoRepository`.

## Configuración

- `_model = RoleModel`
- `_searchFields = ['name']`
- `_populateFields = ['childRoles']`

## Métodos propios

- `findByName(name)`
- `findCursor(options)`
