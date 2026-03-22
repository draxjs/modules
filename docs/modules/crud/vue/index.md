# Crud Vue

## Propósito

`crud-vue` aporta una UI CRUD genérica sobre Vue, Vuetify y Pinia.

## Secciones

- `crud`: clase base `EntityCrud`, corazón declarativo del módulo.
- `components`: tablas, galerías, formularios, diálogos, filtros y botones CRUD.
- `composables`: lógica reutilizable de paginación, filtros, columnas, forms y group-by.
- `helpers`: helpers puntuales de identificación de items.
- `stores`: estado compartido para entidades, group-by y formularios CRUD.

## Cuándo usarlo

Usalo cuando quieras renderizar una entidad CRUD declarativa a partir de `EntityCrud` y un provider, sin construir manualmente cada pantalla.
