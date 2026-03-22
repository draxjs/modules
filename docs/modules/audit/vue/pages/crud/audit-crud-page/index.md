# AuditCrudPage

## Propósito

`AuditCrudPage.vue` monta la pantalla principal de consulta de auditoría.

## Personalizaciones

- usa `Crud` con `AuditCrud.instance`
- reemplaza el filtro de `entity` por `EntityCombobox`
- formatea `createdAt`
- muestra `user`, `tenant`, `action` y `entity` con rendering específico
- usa `AuditView` en el slot `form` para el detalle

## Cuándo usarlo

Es la página indicada cuando solo querés listado, filtros y vista detallada de auditoría.
