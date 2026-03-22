# FileSystemFactory

## Propósito

`FileSystemFactory` crea un `FileSystem` sobre REST o GraphQL.

## Cómo decide

- usa `VITE_HTTP_TRANSPORT` o el parámetro recibido
- con `GRAPHQL` instancia `FileGqlProvider`
- con `REST` instancia `FileRestProvider`
- en ambos casos devuelve un singleton de `FileSystem`
