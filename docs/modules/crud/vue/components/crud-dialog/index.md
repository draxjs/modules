# CrudDialog

## Propósito

`CrudDialog` encapsula el modal usado por el CRUD para crear, editar, ver o eliminar registros.

## v-model

- `modelValue` (`boolean`): abre o cierra el dialog.

## Props

- `entity` (`IEntityCrud`, requerida)
- `operation` (`IEntityCrudOperation`)
- `fullscreen` (`boolean | undefined`)
- `maxWidth` (`string | undefined`)

Si `fullscreen` o `maxWidth` no se envían, el componente usa la configuración de la entidad (`dialogFullscreen`, `dialogMaxWidth`).

## Eventos

- `submit`
- `close`

La implementación actual declara los eventos, pero el cierre concreto ocurre cambiando el `v-model` desde el botón superior.

## Slot

- default: contenido del cuerpo del dialog.

## Cómo calcula el título

- Si existe traducción `operation.<operation>`, la usa.
- Intenta interpolar el nombre traducido de la entidad con la clave `<entity>.entity`.
- Si no hay traducción, muestra la operación cruda.

## Ejemplo

```vue
<CrudDialog v-model="open" :entity="userEntity" operation="edit" max-width="900">
  <CrudForm :entity="userEntity" />
</CrudDialog>
```

## Cuándo usarlo

Usalo cuando necesitás reutilizar el look & feel del diálogo CRUD sin depender necesariamente del componente `Crud`.
