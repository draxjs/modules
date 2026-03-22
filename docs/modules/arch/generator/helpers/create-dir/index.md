# createDir

## Propósito

`createDir` envuelve `fs.mkdir` con `recursive: true` para garantizar que la estructura de salida exista antes de escribir archivos.

## Cuándo aparece

Lo usa `writeFile` antes de persistir cualquier template. Eso evita que el generador falle cuando la carpeta del módulo o de la entidad todavía no existe.
