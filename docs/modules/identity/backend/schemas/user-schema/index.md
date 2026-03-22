# UserSchema

## Propósito

`UserSchema` define los contratos Zod del agregado usuario.

## Schemas

- `UserBaseSchema`
  - `name`
  - `username`
  - `email`
  - `phone?`
  - `active?`
  - `role`
  - `tenant?`
- `UserCreateSchema`
  - agrega `password`
- `UserUpdateSchema`
  - hoy reutiliza `UserBaseSchema`
- `UserSchema`
  - agrega `_id`
  - `role` poblado
  - `tenant` poblado
  - `createdAt?`
  - `avatar?`
