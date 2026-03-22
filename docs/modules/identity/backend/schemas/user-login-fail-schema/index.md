# UserLoginFailSchema

## Propósito

`UserLoginFailSchema` modela intentos fallidos de autenticación.

## Schemas

- `UserLoginFailBaseSchema`
  - `username`
  - `userAgent?`
  - `ip?`
- `UserLoginFailSchema`
  - agrega `_id` y `createdAt?`
