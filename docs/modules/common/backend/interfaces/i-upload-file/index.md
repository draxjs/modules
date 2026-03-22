# IUploadFile

## Propósito

`IUploadFile.ts` define los contratos de upload usados por `StoreManager`.

## Piezas principales

- `IUploadFile`: archivo de entrada con stream, nombre y mimetype
- `IUploadFileResult`: resultado persistido con `path` y `size`
- `IUploadFileOptions`: restricciones opcionales de extensiones, mimetypes y tamaño máximo
