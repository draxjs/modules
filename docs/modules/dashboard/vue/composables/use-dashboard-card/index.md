# useDashboardCard

## Propósito

`useDashboardCard()` resuelve todo lo necesario para ejecutar una tarjeta dashboard.

## Qué expone

- `cardEntity`
- `cardEntityFields`
- `cardEntityProvider`
- `groupByHeaders`
- `paginateHeaders`
- `fetchGroupByData()`
- `fetchPaginateData()`

## Cómo funciona

- toma `entityInstance` si la tarjeta ya lo trae
- si no, busca la entidad en `useEntityStore()`
- arma encabezados usando i18n cuando hay traducciones disponibles
- delega las consultas al provider CRUD de la entidad
