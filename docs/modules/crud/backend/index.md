# Crud Backend

## Propósito

`crud-back` es la capa base del servidor para recursos CRUD en Drax, con soporte para MongoDB, SQLite, exportación y rutas Fastify documentadas con schemas Zod.

## Secciones

- `builders`: generación de schemas de ruta para Fastify/OpenAPI.
- `controllers`: controlador abstracto con endpoints CRUD, export y group-by.
- `events`: emisor de eventos CRUD.
- `exports`: exportación a CSV y JSON.
- `imports`: espacio reservado para importación.
- `regexs`: validación del formato de filtros en querystring.
- `repository`: repositorios abstractos para Mongo y SQLite.
- `schemas`: schemas compartidos de params, query y responses.
- `services`: servicio abstracto con validación, hooks y exportación.
- `workers`: workers de apoyo para exportación.

## Cuándo usarlo

Usalo cuando quieras construir un módulo backend CRUD reutilizando piezas genéricas en vez de implementar todo desde cero para cada entidad.
