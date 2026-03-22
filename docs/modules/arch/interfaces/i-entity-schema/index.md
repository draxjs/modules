# IEntitySchema

## Propósito

`IEntitySchema` es la pieza más importante de Arch. Describe una entidad y toda la metadata necesaria para generar código.

## Campos relevantes

- `name` y `module`: identifican la entidad y el módulo de salida.
- `identifier`: permite cambiar el campo identificador en SQLite.
- `apiBasePath` y `apiTag`: personalizan la capa HTTP.
- `schema`: describe todos los campos.
- `tabs` y `menus`: agregan agrupación visual en frontend.

## Tipos de campo soportados

Incluye strings, números, booleanos, fechas, referencias, enums, archivos, records, objetos anidados y versiones `array.*` de varios de esos tipos.

## Ejemplo real

`packages/zuite/zuite-arch/src/schemas/people/PersonSchema.ts` muestra un uso completo con tabs, refs, enums, arrays y objetos anidados.
