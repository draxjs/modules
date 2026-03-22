# MediaSystemFactory

## Propósito

`MediaSystemFactory` crea la fachada `MediaSystem` para uploads.

## Cómo decide

- con `GRAPHQL` usa `MediaGqlProvider`
- con `REST` usa `MediaRestProvider`
- mantiene una única instancia singleton
