# CreateUserIfNotExist

## Propósito

`CreateUserIfNotExist` crea un usuario inicial solo si su `username` no existe.

## Qué hace

- busca el usuario por `username`
- resuelve `role` por nombre a `_id`
- si hay `tenant`, también lo resuelve por nombre a `_id`
- crea el usuario si no existía
