# DashboardConfigPage

## Propósito

`DashboardConfigPage.vue` carga un dashboard por `identifier` y habilita su edición visual.

## Qué hace

- lee `route.params.identifier`
- consulta `DashboardProvider.instance.findOne({ filters })`
- renderiza `DashboardConfig`
- persiste cambios con `DashboardProvider.instance.update()`
- ofrece un botón para abrir la vista de lectura del dashboard
