# PaginateCard

## Propósito

`PaginateCard.vue` ejecuta una consulta paginada para la entidad de la tarjeta.

## Qué hace

- usa `useDashboardCard(card)`
- llama `fetchPaginateData()` en `onMounted`
- delega el render final a `PaginateTableRender`
