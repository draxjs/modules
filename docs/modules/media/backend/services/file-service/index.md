# FileService

## Propósito

`FileService` extiende `AbstractService` para operar la metadata de archivos.

## Particularidades

- activa `_validateOutput = true`
- `registerUploadedFile()`: crea la metadata luego del upload físico
- `registerDownloadHit()`: busca por `relativePath`, incrementa `hits` y actualiza `lastAccess`
