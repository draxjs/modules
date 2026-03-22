# DashboardModel

## Propósito

`DashboardModel` persiste dashboards en Mongo con soporte de paginación.

## Estructura principal

- `identifier` y `title` únicos
- `cards[]` con `title`, `entity`, `type`, `filters`, `layout`, `groupBy` y `paginate`
- timestamps automáticos

## Detalles

- usa `mongoose-paginate-v2`
- usa `mongoose-unique-validator`
- agrega virtual `id` basado en `_id`
- exporta el modelo `Dashboard`
