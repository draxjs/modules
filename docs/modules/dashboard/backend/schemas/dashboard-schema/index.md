# DashboardSchema

## Propósito

`DashboardBaseSchema` y `DashboardSchema` validan la configuración de dashboards.

## Base

`DashboardBaseSchema` exige:

- `identifier`
- `title`

Y admite `cards[]` con:

- `entity`
- `type` en `paginate | groupBy`
- `title`
- `filters[]`
- `layout`
- `groupBy`
- `paginate`

## Extensión

`DashboardSchema` agrega `_id` a la versión persistida.
