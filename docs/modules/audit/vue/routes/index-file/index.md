# index

## Propósito

El `index.ts` de `routes` reexporta la lista total de rutas del módulo.

## Cómo funciona

- importa `AuditCrudRoute`
- expone un arreglo `index` con `...AuditCrudRoute`
- exporta ese arreglo como default
