# Utils

## Propósito

`utils` reúne helpers puntuales que no pertenecen a una integración específica.

## Piezas principales

- `createDirIfNotExist(dirPath)` asegura directorios de trabajo.
- `isValidIsoDate(value)` valida fechas ISO.
- `isValidObjectId(id)` valida ids de Mongo.
- `setNestedValue(obj, path, value)` escribe propiedades anidadas.
- `WorkerHandler` encapsula trabajo con workers.
- `GraphqlMerger` compone typeDefs y resolvers desde archivos.

## Cuándo usarlo

Usalo como caja de herramientas para tareas pequeñas de infraestructura, validación o composición.
