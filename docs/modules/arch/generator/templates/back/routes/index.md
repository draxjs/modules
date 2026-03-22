# Routes

## Propósito

`TemplateRoutes` genera el archivo de rutas Fastify de una entidad.

## Qué endpoints expone

- paginación
- búsqueda exacta y por texto
- búsqueda por id
- `find-one`
- `group-by`
- alta, edición total, edición parcial y baja
- exportación

## Detalles relevantes

Usa `CrudSchemaBuilder` para asociar schemas OpenAPI y respeta `apiBasePath` y `apiTag` cuando la entidad los define.
