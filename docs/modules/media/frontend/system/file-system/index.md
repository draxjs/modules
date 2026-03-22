# FileSystem

## Propósito

`FileSystem` envuelve un `IFileProvider` y expone su API con chequeos explícitos por método.

## Qué ofrece

- `paginate`, `create`, `update`, `delete`, `updatePartial`
- `findById`, `findByIds`, `search`, `find`, `findOne`
- `groupBy`, `export`

## Rol

Funciona como fachada estable del módulo hacia el resto de la aplicación.
