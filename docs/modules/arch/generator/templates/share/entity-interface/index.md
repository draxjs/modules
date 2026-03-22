# EntityInterface

## Propósito

`TemplateEntityInterface` genera `I<Entidad>Base` e `I<Entidad>`.

## Qué traduce

Convierte los tipos declarativos de `IEntitySchema` en tipos TypeScript, incluyendo objetos y arrays anidados, records y estructuras de archivo completo.

## Dónde se usa

`ArchGenerator` escribe esta interfaz tanto en `back/interfaces` como en `front/interfaces`, para que ambas capas trabajen con el mismo contrato.
