# SqliteRepository

## Propósito

`TemplateSqliteRepository` genera un repositorio basado en `AbstractSqliteRepository`.

## Qué deriva del schema

- Campos de búsqueda.
- Campos booleanos.
- Campos a popular para referencias.
- Estructura de columnas SQLite.
- Nombre de identificador, con override por `identifier`.

## Observación

La plantilla mapea `number` a `FLOAT` y el resto de los campos a `TEXT`, lo que deja la persistencia SQLite alineada con el CRUD estándar de Drax.
