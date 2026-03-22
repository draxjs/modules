# DateScalar

## Propósito

`DateScalar.resolvers.ts` define el scalar GraphQL `Date`.

## Qué hace

Usa `dayjs` para parsear valores entrantes a `Date` y serializar valores salientes como ISO string.
