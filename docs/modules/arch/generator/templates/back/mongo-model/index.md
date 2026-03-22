# MongoModel

## Propósito

`TemplateMongoModel` genera un modelo Mongoose con soporte para timestamps, `virtual id`, validación de unicidad y paginación.

## Qué interpreta del schema

- Mapea tipos simples a `String`, `Number`, `Boolean` y `Date`.
- Convierte `ref` en `ObjectId`.
- Soporta `record`, `enum`, `object`, `array.object` y `fullFile`.
- Usa `collectionName` cuando la entidad lo declara.

## Cuándo aporta valor

Permite tener un modelo Mongo coherente con la definición declarativa sin escribir el schema a mano.
