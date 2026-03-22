# HttpClientFactory

## Propósito

`HttpClientFactory` elige entre REST y GraphQL según `VITE_HTTP_TRANSPORT`.

## Qué hace

Mantiene una instancia singleton y delega en `HttpRestClientFactory` o `HttpGqlClientFactory`.
