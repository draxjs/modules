# UserSessionSchema

## Propósito

`UserSessionSchema` modela sesiones de usuario.

## Schemas

- `UserSessionBaseSchema`
  - `uuid`
  - `user`
  - `userAgent?`
  - `ip?`
- `UserSessionSchema`
  - agrega `_id`
  - `user` poblado con `_id` y `username`
  - `createdAt?`
