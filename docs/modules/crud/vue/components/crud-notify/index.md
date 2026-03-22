# CrudNotify

## Propósito

`CrudNotify` es un wrapper mínimo de `v-snackbar` para mensajes cortos asociados al flujo CRUD.

## v-model

- `modelValue` (`boolean`)

## Props

- `message` (`string`)
- `color` (`string`, default `success`)
- `timeout` (`number`, default `3000`)

## Qué hace

- Muestra el mensaje recibido.
- Permite cerrar manualmente con un botón `mdi-close`.
- Se usa desde `Crud` para feedback inmediato después de operaciones.

## Ejemplo

```vue
<CrudNotify v-model="notify" message="Guardado correctamente" color="success" />
```

## Cuándo usarlo

Usalo para notificaciones breves. Si necesitás errores complejos o acciones múltiples, conviene otra capa de feedback.
