# GraphQL

## Propósito

Esta sección arma el paquete GraphQL común a partir de archivos de tipos y resolvers cargados dinámicamente.

## Piezas principales

- `graphql/index.ts` devuelve `typeDefs` y `resolvers` combinados para el directorio actual.
- `GraphqlMerger.mergeTypeDefs(dirname)` usa `@graphql-tools/load-files` y `mergeTypeDefs`.
- `GraphqlMerger.mergeResolvers(dirname)` hace lo mismo con archivos `*.resolvers.*`.
- En la exportación raíz del paquete también se publican `commonTypeDefs` y `commonResolvers`.

## Cuándo usarlo

Resulta útil cuando varios módulos agregan piezas GraphQL y querés componerlas sin mantener imports manuales por archivo.
