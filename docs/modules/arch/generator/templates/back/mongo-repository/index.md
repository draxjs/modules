# MongoRepository

## Propósito

`TemplateMongoRepository` genera un repositorio que extiende `AbstractMongoRepository`.

## Qué configura

- Modelo Mongoose de la entidad.
- Campos de búsqueda derivados de `search: true`.
- Campos a popular derivados de `ref` y `array.ref`.
- Modo `lean` para devolver objetos planos.
