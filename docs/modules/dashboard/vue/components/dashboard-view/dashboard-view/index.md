# DashboardView

## Propósito

`DashboardView.vue` muestra un dashboard ya resuelto.

## Qué hace

- recibe `dashboard` como prop
- renderiza el título
- itera las tarjetas respetando `layout`
- delega cada tarjeta a `PaginateCard` o `GroupByCard`
