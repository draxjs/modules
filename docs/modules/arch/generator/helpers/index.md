# Helpers

## Propósito

Los helpers encapsulan las operaciones de filesystem usadas por el generador. Son utilidades pequeñas, pero todo el pipeline depende de ellas para persistir la salida.

## Piezas principales

- `createDir`: asegura que exista la carpeta destino.
- `readFileContent`: lee archivos de soporte cuando un template necesita contenido externo.
- `writeFile`: crea el directorio y escribe el archivo final.
