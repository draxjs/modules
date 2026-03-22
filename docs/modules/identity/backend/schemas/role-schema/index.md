# RoleSchema

## Propósito

`RoleSchema` define los contratos Zod de roles.

## Schemas

- `RoleBaseSchema`
  - `name`
  - `permissions?`
  - `icon?`
  - `color?`
  - `childRoles?`
- `RoleSchema`
  - agrega `_id`, `id?`, `readonly`, timestamps y `childRoles` poblados

## Validación destacada

`name` debe empezar con mayúscula.
