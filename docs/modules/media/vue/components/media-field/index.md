# MediaField

## Propósito

`MediaField.vue` es un campo de formulario para subir un archivo y almacenar solo su URL.

## Qué hace

- usa `MediaSystemFactory.getInstance()`
- soporta click y drag & drop
- sube al directorio configurable `dir`
- asigna `file.url` al modelo
- puede mostrar preview de imagen cuando `preview` está activo
