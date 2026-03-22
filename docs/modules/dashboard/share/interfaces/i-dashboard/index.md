# IDashboard

## Propósito

`IDashboard`, `IDashboardBase` e `IDashboardCard` describen la estructura compartida del módulo.

## IDashboardCard

Define una tarjeta con:

- `entity` y opcional `entityInstance`
- `type` en `paginate | groupBy`
- `title`
- `filters`
- `layout`
- `groupBy`
- `paginate`

## Tipos principales

- `IDashboardBase`: dashboard sin `_id`
- `IDashboard`: dashboard persistido con `_id`
