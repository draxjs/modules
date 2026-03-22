# AuditCrudDashboardPage

## Propósito

`AuditCrudDashboardPage.vue` combina la grilla CRUD y el dashboard del módulo en una misma pantalla.

## Estructura

- tab `crud`: reutiliza el listado con slots de formato y `AuditView`
- tab `dashboard`: renderiza `AuditDashboard`

## Cuándo usarlo

Usalo cuando quieras alternar entre inspección detallada y visión agregada sin salir de la página.
