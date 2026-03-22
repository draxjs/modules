# Store

## Propósito

`store` implementa guardado de archivos por stream con validación de tamaño y utilidades para borrado.

## Piezas principales

- `StoreManager.saveFile(file, destinationPath, options?)` valida nombre, stream, extensión, mimetype y tamaño antes de escribir.
- `StoreManager.deleteFile` y `deleteFilepath` eliminan archivos ignorando `ENOENT`.
- `StreamFileStore` conecta el stream de entrada con el filesystem usando `pipeline`.
- `StreamSizeValidator` corta la escritura cuando se supera el tamaño máximo y lanza `UploadFileError`.

## Cuándo usarlo

Resulta útil para uploads GraphQL o HTTP donde el backend necesita persistir archivos locales con validación previa.
