# Services

## Propósito

`services` contiene la factory principal del servicio de archivos.

## Piezas principales

- `FileServiceFactory`: elige repositorio Mongo o SQLite y expone un singleton de `FileService`.
