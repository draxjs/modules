# UserSessionModel

## Propósito

`UserSessionModel` persiste sesiones emitidas por login exitoso.

## Campos

- `uuid`
- `user` ref a `User`
- `userAgent`
- `ip`

## Plugins

- `mongoose-unique-validator`
- `mongoose-paginate-v2`

## Particularidad

Maneja `OverwriteModelError` igual que `UserLoginFailModel`.
