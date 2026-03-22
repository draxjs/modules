# StreamSizeValidator

## Propósito

`StreamSizeValidator` es un `Transform` que controla el tamaño total de un upload.

## Qué hace

Cuenta bytes procesados y destruye el stream con `UploadFileError` cuando se supera `maxSize`.
