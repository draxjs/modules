# SQLite

## Propósito

`sqlite` facilita crear o evolucionar tablas de SQLite desde una definición de campos.

## Piezas principales

- `SqliteTableBuilder` crea la tabla si no existe y agrega columnas faltantes.
- `SqliteTableField` describe cada columna con `name`, `type`, `primary`, `unique` y `custom`.
- El builder valida tipos permitidos (`NULL`, `INTEGER`, `REAL`, `TEXT`, `BLOB`, `NUMERIC`) y expone `tableExist()` y `columnExist()`.

## Cuándo usarlo

Sirve para módulos que necesitan bootstrap liviano sobre SQLite sin incorporar una capa completa de migraciones.
