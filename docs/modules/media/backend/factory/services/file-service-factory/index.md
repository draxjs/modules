# FileServiceFactory

## Propósito

`FileServiceFactory` construye la instancia singleton de `FileService`.

## Cómo decide

- usa `FileMongoRepository` si `DbEngine` es `MONGODB`
- usa `FileSqliteRepository` y ejecuta `build()` si `DbEngine` es `SQLITE`
- inyecta `FileBaseSchema` y `FileSchema`

## Resultado

Expone el servicio por `FileServiceFactory.instance`.
