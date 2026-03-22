# FileMongoRepository

## Propósito

`FileMongoRepository` implementa `IFileRepository` sobre `AbstractMongoRepository`.

## Configuración

- usa `FileModel` como `_model`
- permite búsqueda por `filename`, `url`, `description`, `tags`, `mimetype`, `extension` y `type`
- popula `tenant`
- activa `_lean = true`
