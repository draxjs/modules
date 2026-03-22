# DashboardSqliteRepository

## Propósito

`DashboardSqliteRepository` implementa `IDashboardRepository` sobre `AbstractSqliteRepository`.

## Estructura

- tabla `dashboards`
- columnas `identifier`, `title`, `cards`, `createdAt` y `updatedAt`
- `identifier` y `title` son únicos

## Adaptaciones

- `prepareData()` serializa `cards` a JSON
- `prepareItem()` deserializa `cards` al leer
