# MediaFullField

## Propósito

`MediaFullField.vue` es un campo de upload que almacena el objeto completo `IMediaFile`.

## Qué hace

- usa `MediaSystemFactory.getInstance()`
- soporta click y drag & drop
- asigna el objeto completo devuelto por `uploadFile()`
- expone un `computed` para reflejar la URL en el `v-text-field`
- puede mostrar preview de imagen
