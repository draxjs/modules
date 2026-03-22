# CrudRoute

## Propósito

`TemplateCrudRoute` genera la definición de ruta Vue para la página CRUD de la entidad.

## Qué fija

- `name` de la ruta.
- `path` bajo `/crud/<entidad>`.
- `meta.auth`.
- permiso `:<manage>` para proteger el acceso.
