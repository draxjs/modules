# HttpRestClient

## Propósito

`HttpRestClient` implementa `IHttpClient` para transporte REST.

## Qué hace

Expone `get`, `post`, `put`, `delete` y `patch`, compone query params, permite agregar o remover headers y transforma errores de `fetch` en errores de alto nivel.
