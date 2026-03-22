# Common Backend

## Propósito

`common-back` reúne infraestructura base para servicios de Drax: configuración centralizada, caché, manejo homogéneo de errores, utilidades de consulta y helpers para archivos, GraphQL y persistencia.

## Secciones

- `cache`: fachada `DraxCache` con adapters local y Redis.
- `config`: claves de entorno y acceso tipado a configuración.
- `constants`: constantes compartidas del backend.
- `controllers`: `CommonController` para traducir errores a respuestas HTTP.
- `errors`: errores de dominio y adapters para convertir errores externos.
- `graphql`: carga y merge de typeDefs/resolvers.
- `interfaces`: contratos para config, filtros, caché y uploads.
- `mongoose`: helpers para conexión, filtros, sort y soft delete.
- `setup`: bootstrap de configuración desde variables de entorno.
- `sql`: filtros y ordenamiento para consultas SQL.
- `sqlite`: construcción incremental de tablas.
- `store`: guardado y validación de archivos por stream.
- `utils`: helpers generales para workers, fechas, ObjectId, GraphQL y objetos anidados.

## Cuándo usarlo

Usalo cuando un módulo backend necesite resolver infraestructura común sin reimplementar integración con Redis, SQLite, Mongoose o manejo repetitivo de errores.
