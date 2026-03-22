# PaginateTableRender

## Propósito

`PaginateTableRender.vue` muestra un resultado paginado con `v-data-table-server`.

## Qué hace

- toma `items`, `page`, `limit` y `total` desde `IDraxPaginateResult`
- formatea refs y fechas según el tipo del campo
- usa `headers` y `fields` generados por `useDashboardCard`
