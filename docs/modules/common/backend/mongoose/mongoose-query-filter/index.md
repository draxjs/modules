# MongooseQueryFilter

## Propósito

`MongooseQueryFilter` traduce arreglos de `IQueryFilter` a una query Mongo/Mongoose.

## Qué resuelve

- operadores como `eq`, `like`, `in`, `gt` y `empty`
- coerción de fechas ISO
- validación y conversión de `ObjectId`
- soporte opcional para inferir si un campo del modelo es `ObjectId`
