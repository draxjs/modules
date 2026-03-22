# GqlError

## Propósito

`GqlError` representa un error individual devuelto por GraphQL.

## Qué expone

Mantiene `message`, `path`, `extensions` y el getter `isBadUserInput`, que verifica si `extensions.code === 'BAD_USER_INPUT'`.
