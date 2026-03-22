# CrudFilterButton

## Propósito

`CrudFilterButton` alterna el modo de filtros dinámicos en el store CRUD.

## Props

- `entity` (`IEntityCrud`, requerida)

## Cómo funciona

- Lee `dynamicFiltersEnable` desde `useCrudStore(entity.name)`.
- Al hacer click invierte ese flag mediante `store.setDynamicFiltersEnable(...)`.
- Cambia el ícono entre `mdi-filter` y `mdi-filter-off`.
- Solo se muestra si `entity.isFilterable` es verdadero.

## Ejemplo

```vue
<CrudFilterButton :entity="auditEntity" />
```
