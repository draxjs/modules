# Mongoose

## Propósito

La carpeta concentra helpers para conexión, filtrado, ordenamiento y soft delete sobre modelos Mongoose.

## Piezas principales

- `MongooseConector` encapsula la conexión a MongoDB.
- `MongooseQueryFilter.applyFilters(query, filters, model?)` transforma un arreglo de `IQueryFilter` en operadores Mongoose y valida `ObjectId`/fechas.
- `MongooseSort` construye criterios de ordenamiento.
- `MongooseSoftDelete` agrega campos y hooks de soft delete al esquema.
- `MongooseTransform` complementa la transformación de documentos.

## Cuándo usarlo

Conviene cuando querés aceptar filtros dinámicos de UI o API y traducirlos a queries Mongoose de forma consistente.
