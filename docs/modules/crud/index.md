# Crud

## Propósito

`crud` provee la infraestructura genérica para construir operaciones CRUD sobre backend, frontend, contratos compartidos y UI Vue reutilizable.

## Submódulos disponibles

### Backend

Expone controladores, repositorios abstractos, builders de schema, exportadores y servicios base para CRUDs.

### Frontend

Incluye providers REST abstractos para consumir endpoints CRUD con una API homogénea.

### Share

Define contratos TypeScript para operaciones CRUD, paginación, exportación, filtros y metadatos de entidades.

### Vue

Agrupa componentes, composables, stores y helpers para renderizar CRUDs configurables en interfaz.

## Cómo se relacionan

- `crud-share` define el vocabulario común de entidades, filtros, paginación y permisos.
- `crud-back` implementa la infraestructura del servidor y serializa rutas, validación y exportación.
- `crud-front` convierte esa API en providers REST reutilizables.
- `crud-vue` consume providers y metadata `IEntityCrud` para montar tablas, formularios, filtros y diálogos.
