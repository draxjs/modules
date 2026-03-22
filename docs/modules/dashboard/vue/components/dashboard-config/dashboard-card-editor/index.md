# DashboardCardEditor

## Propósito

`DashboardCardEditor.vue` edita la configuración de una tarjeta individual.

## Qué permite configurar

- `title`, `entity` y `type`
- variante visual y altura
- filtros dinámicos basados en la entidad elegida
- columnas de `paginate`
- campos, formato de fecha y render de `groupBy`

## Integraciones

- usa `useEntityStore()` para descubrir entidades disponibles
- usa `useDynamicFilters()` y `CrudFormField` de `crud-vue`
- emite `save` y `cancel`
