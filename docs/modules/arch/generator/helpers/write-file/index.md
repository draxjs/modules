# writeFile

## Propósito

`writeFile` es la operación de persistencia central del generador.

## Qué hace

- Asegura la carpeta con `createDir`.
- Compone `dirPath/fileName`.
- Escribe el contenido en UTF-8.

## Relación con ArchGenerator

`ArchGenerator` delega en este helper toda la escritura de archivos generados para mantener la lógica de generación separada del acceso al filesystem.
