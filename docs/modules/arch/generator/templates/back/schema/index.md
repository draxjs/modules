# Schema

## Propósito

`TemplateSchema` genera los schemas Zod base y completo de la entidad.

## Qué interpreta

- Tipos primitivos, enums, referencias, records y fechas.
- Objetos y arrays anidados.
- Tipos de archivo simple y archivo completo.
- Defaults y optionalidad.

## Resultado

- `<Entidad>BaseSchema`: shape de entrada para create y update.
- `<Entidad>Schema`: extiende el base schema e incorpora `_id` y referencias expandidas.
