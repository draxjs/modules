# FileGqlProvider

## Propósito

`FileGqlProvider` implementa `IFileProvider` sobre un cliente GraphQL.

## Qué cubre

- `create`, `update`, `updatePartial`, `delete`
- `search`, `findById`, `findByIds`, `find`, `findOne`
- `groupBy`, `paginate`, `export`

## Detalles

Centraliza los campos GraphQL del recurso en `gqlFields` para reutilizarlos en queries y mutations.
