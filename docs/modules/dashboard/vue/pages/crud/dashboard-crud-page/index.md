# DashboardCrudPage

## Propósito

`DashboardCrudPage.vue` monta el CRUD de dashboards con presentación tipo galería.

## Personalizaciones

- usa `Crud` con `DashboardCrud.instance`
- renderiza cada item como `v-card` con `title` e `identifier`
- agrega acciones rápidas para abrir `/dashboard/view/:identifier` y `/dashboard/config/:identifier`
