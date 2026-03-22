# Services

## Propósito

`services` agrupa la factory concreta del servicio de dashboards.

## Piezas principales

- `DashboardServiceFactory`: elige repositorio Mongo o SQLite y expone un singleton de `DashboardService`.
