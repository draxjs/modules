# MediaController

## Propósito

`MediaController` maneja el flujo binario del módulo: subida y descarga de archivos.

## Qué hace

- valida el directorio lógico de destino con `validateDir()`
- exige `MediaPermissions.UploadFile` para `uploadFile()`
- arma la ruta final como `dir/año/mes`
- guarda el archivo usando `StoreManager.saveFile()`
- genera la URL pública basada en `CommonConfig.BaseUrl`
- opcionalmente registra metadata con `FileServiceFactory.instance`
- en `downloadFile()` sirve el archivo con `reply.sendFile()` e incrementa hits si la metadata está activa
