# CrudFiltersAction

## Propósito

`CrudFiltersAction` renderiza las acciones finales del bloque de filtros cuando la entidad no trabaja en modo auto-apply.

## Props

- `entity` (`IEntityCrud`, requerida)

## Eventos

- `applyFilter`
- `clearFilter`

## Qué muestra

- Botón `clear` con clases `entity.cleanFilterClass`
- Botón `filter` con clases `entity.applyFilterClass`

## Ejemplo

```vue
<CrudFiltersAction
  :entity="customerEntity"
  @clearFilter="clearFilters"
  @applyFilter="applyFilters"
/>
```

## Cuándo usarlo

Usalo cuando querés separar edición de filtros y aplicación efectiva, evitando una nueva consulta por cada cambio de input.
