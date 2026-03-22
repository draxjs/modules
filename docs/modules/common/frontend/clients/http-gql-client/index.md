# HttpGqlClient

## Propósito

`HttpGqlClient` implementa `IGqlClient` sobre `fetch`.

## Qué hace

Ejecuta queries, mutations y uploads; maneja headers y timeout; y traduce errores GraphQL, HTTP, de red o desconocidos a la jerarquía de errores de `common-front`.
