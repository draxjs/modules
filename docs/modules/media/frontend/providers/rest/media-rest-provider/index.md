# MediaRestProvider

## Propósito

`MediaRestProvider` implementa la subida de archivos por REST.

## Qué hace

- envía `POST /api/file/:dir`
- usa `FormData` con el binario
- permite configurar `timeout`
- elimina el header `content-type` para que el cliente establezca el boundary correcto
