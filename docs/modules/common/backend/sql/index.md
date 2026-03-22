# SQL

## Propósito

La carpeta resuelve filtros y ordenamiento para consultas SQL generadas de forma dinámica.

## Piezas principales

- `SqlQueryFilter.applyFilters(where, filters)` construye cláusulas `WHERE` parametrizadas y devuelve `{ where, params }`.
- `SqlSort` encapsula el armado de ordenamiento.
- `SqlQueryFilterOld` conserva una implementación anterior del filtrado.

## Cuándo usarlo

Es la opción adecuada cuando una API expone filtros comunes y la persistencia subyacente usa SQL en lugar de Mongoose.
