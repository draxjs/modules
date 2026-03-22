# DashboardCrud

## Propósito

`DashboardCrud` describe cómo debe renderizarse y comportarse la entidad Dashboard en `crud-vue`.

## Configuración relevante

- `name = 'Dashboard'`
- provider: `DashboardProvider.instance`
- permisos CRUD completos
- `listMode = 'gallery'`
- `searchEnable = false`
- `dynamicFiltersEnable = false`
- `filterButtons = false`
- `isCreatable = true`
- `isDeletable = true`
- `isViewable = false`
- `isEditable = false`

## Particularidades

- limita `fields` editables a `identifier` y `title`
- devuelve a `/dashboard/config/<identifier>` al crear un dashboard
- obtiene entidades registradas desde `useEntityStore()`
