# GraphQL

## Propósito

`graphql` compone el schema y los resolvers de identidad para exponer el dominio por GraphQL.

## Piezas principales

- `graphql/index.ts`: usa el merger común para combinar typeDefs y resolvers.
- Resolvers por agregado:
  - `user.resolvers`
  - `role.resolvers`
  - `tenant.resolvers`
  - `user-api-key.resolvers`

Estos resolvers delegan en las mismas factories y servicios usados por REST.

## Cuándo usarlo

Usalo cuando la aplicación quiera exponer identidad a través de un único endpoint GraphQL manteniendo la lógica de negocio centralizada.
