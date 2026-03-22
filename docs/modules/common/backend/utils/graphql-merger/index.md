# GraphqlMerger

## Propósito

`GraphqlMerger` carga y combina typeDefs y resolvers desde el filesystem.

## Qué usa

Se apoya en `@graphql-tools/load-files` y `@graphql-tools/merge`, con imports dinámicos vía `pathToFileURL`.
