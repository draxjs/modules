# graphql/index

## Propósito

El `index.ts` de `graphql` actúa como agregador del esquema GraphQL del módulo identidad.

## Qué hace

- obtiene el `__dirname` del módulo actual
- llama `GraphqlMerger.mergeTypeDefs(__dirname)`
- llama `GraphqlMerger.mergeResolvers(__dirname)`
- retorna `{ typeDefs, resolvers }`

## Resultado

La función exportada devuelve el par necesario para registrar el subesquema GraphQL del módulo a partir de archivos distribuidos dentro de la misma carpeta.

## Cuándo usarlo

Usalo cuando quieras montar el esquema GraphQL de identidad sin importar manualmente cada type definition o resolver.
