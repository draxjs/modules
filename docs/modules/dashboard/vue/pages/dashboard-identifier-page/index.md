# DashboardIdentifierPage

## Propósito

`DashboardIdentifierPage.vue` muestra un dashboard específico a partir de su `identifier`.

## Qué hace

- lee `route.params.identifier`
- busca el dashboard con `findOne`
- renderiza `DashboardView`
- muestra `v-skeleton-loader` mientras carga
