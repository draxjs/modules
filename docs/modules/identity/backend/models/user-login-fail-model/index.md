# UserLoginFailModel

## Propósito

`UserLoginFailModel` persiste intentos fallidos de login.

## Campos

- `username`
- `userAgent`
- `ip`

## Plugins

- `mongoose-unique-validator`
- `mongoose-paginate-v2`

## Particularidad

Maneja `OverwriteModelError` para reutilizar el modelo si ya fue registrado.
