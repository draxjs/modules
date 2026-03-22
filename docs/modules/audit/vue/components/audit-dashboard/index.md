# AuditDashboard

## Propósito

`AuditDashboard.vue` monta el tablero de auditoría con un filtro de rango de fechas.

## Qué hace

- inicializa `from` al primer día del mes actual
- inicializa `to` al final del día actual
- crea el dashboard con `createAuditDashboard()`
- inyecta esos filtros en todas las cards
- renderiza `DashboardView`

## UI

Usa dos `v-date-input` y una grilla Vuetify para combinar filtro y dashboard.
