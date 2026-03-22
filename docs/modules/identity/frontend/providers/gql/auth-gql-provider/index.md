# AuthGqlProvider

## Propósito

`AuthGqlProvider` implementa `IAuthProvider` sobre GraphQL.

## Qué hace

Resuelve login, `me`, cambio de tenant, cambio de password y avatar por mutaciones/queries; además setea o remueve el header `Authorization`.
