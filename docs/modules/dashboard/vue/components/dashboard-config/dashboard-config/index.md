# DashboardConfig

## Propósito

`DashboardConfig.vue` es el editor principal de dashboards.

## Qué hace

- recibe un `IDashboardBase` por `v-model`
- permite renombrar el dashboard
- agrega, edita, borra, reordena, expande y contrae tarjetas
- renderiza `PaginateCard` o `GroupByCard` como preview
- emite `dashboardUpdated` al persistir cambios

## Interacción

Usa drag and drop nativo para reordenar tarjetas y `DashboardCardEditor` para la edición de cada una.
