# GroupByCard

## Propósito

`GroupByCard.vue` ejecuta un `groupBy` sobre la entidad definida por la tarjeta y elige la visualización apropiada.

## Qué hace

- usa `useDashboardCard(card)`
- llama `fetchGroupByData()`
- recarga datos en `onMounted` y cuando cambia la tarjeta
- delega a `GroupByTableRender`, `GroupByPieRender`, `GroupByBarsRender` o `GroupByGalleryRender`
