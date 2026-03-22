# MongooseSort

## Propósito

`MongooseSort` genera objetos de sort compatibles con Mongoose.

## Qué hace

Recibe `orderBy` y `order`, y devuelve `{ campo: 1 | -1 }` o `null` si no hay criterio de orden.
