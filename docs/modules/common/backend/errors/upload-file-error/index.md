# UploadFileError

## Propósito

`UploadFileError` se usa en la capa de storage cuando falla una validación o persistencia de archivo.

## Detalles

Aunque recibe un `message` en el constructor, la respuesta pública usa siempre `File upload failed` y `statusCode` `400`.
