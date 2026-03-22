# FileSqliteRepository

## Propósito

`FileSqliteRepository` implementa `IFileRepository` sobre `AbstractSqliteRepository`.

## Estructura

- tabla `File`
- columnas para rutas, MIME, fechas, autoría, TTL e hits
- `isPublic` tratado como campo booleano

## Particularidades

Declara `searchFields` amplios para filename, paths, URL, descripción, tags y tipo de archivo.
