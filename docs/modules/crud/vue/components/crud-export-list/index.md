# CrudExportList

## Propósito

`CrudExportList` muestra el historial o resultado de exportaciones generadas para una entidad.

## Props

- `entity` (`IEntityCrud`, requerida)

## Estado consumido

Desde `useCrud(entity)` lee:

- `exportFiles`
- `exportListVisible`
- `exportLoading`
- `exportError`

## Qué renderiza

- `v-card` visible solo cuando `exportListVisible` es `true`
- alerta de error si falló la exportación
- tabla con:
  - `url`
  - `rowCount`
  - `time`
- botones para limpiar la lista o cerrar el panel

## Ejemplo

```vue
<CrudExportList :entity="ordersEntity" />
```

## Cuándo usarlo

Sirve cuando el flujo de export deja archivos disponibles para descarga y querés que el usuario pueda recuperarlos sin salir del contexto actual.
