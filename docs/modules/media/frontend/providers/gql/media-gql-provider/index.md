# MediaGqlProvider

## Propósito

`MediaGqlProvider` implementa el upload binario por GraphQL multipart.

## Qué hace

- arma `operations` y `map` para multipart GraphQL
- adjunta archivo y directorio al `FormData`
- usa `gqlClient.upload()`
- devuelve `uploadFile` como `IMediaFile`
