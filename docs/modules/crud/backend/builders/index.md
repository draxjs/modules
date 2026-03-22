# Builders

## Propósito

`builders` contiene utilidades que construyen metadata reutilizable para la capa HTTP del CRUD. En esta carpeta hoy vive el builder encargado de transformar schemas Zod en definiciones JSON Schema/OpenAPI aptas para Fastify.

## Piezas principales

- `CrudSchemaBuilder`: adapta schemas Zod, normaliza tipos no serializables directamente como `Date` y genera contratos listos para endpoints CRUD.

## Qué resuelve

- conversión de `zod` a JSON Schema
- adaptación de `ZodDate` a string ISO para documentación
- generación consistente de `params`, `query` y `response`
- reutilización de respuestas de error y validación
- soporte de `tags` para documentación OpenAPI

## Página por elemento

- [CrudSchemaBuilder](/modules/crud/backend/builders/crud-schema-builder/)

## Cuándo usarlo

Conviene cuando una ruta CRUD necesita response schemas coherentes y documentación OpenAPI sin duplicar definiciones.
