# CrudGroupByButton

## Propósito

`CrudGroupByButton` abre un diálogo de agrupación y muestra resultados agregados por campos seleccionados.

## Props

- `entity` (`IEntityCrud`, requerida)

## Evento

- `groupBy`

La implementación actual declara el evento, pero el flujo visible se apoya principalmente en el estado del composable `useCrudGroupBy`.

## Estado consumido

Desde `useCrudGroupBy(entity)` usa:

- `dialog`
- `selectedFields`
- `loading`
- `groupByData`
- `availableFields`
- `dateFormat`
- `hasDateFields`
- `dateFormatOptions`
- `openDialog`
- `resetAndClose`
- `handleGroupBy`

## Qué resuelve

- Selección múltiple de campos agrupables.
- Selector de granularidad para fechas.
- Visualización de filtros activos con `CrudActiveFilters`.
- Tabla final con conteos y formatos especiales para `ref` y `date`.

## Ejemplo

```vue
<CrudGroupByButton :entity="salesEntity" />
```
