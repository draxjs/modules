# SqliteErrorToValidationError

## Propósito

Adapta errores de SQLite a `ValidationError` cuando detecta violaciones de clave primaria o unicidad.

## Qué interpreta

Soporta `SQLITE_CONSTRAINT_PRIMARYKEY` y `SQLITE_CONSTRAINT_UNIQUE`; si el código no coincide, devuelve el error original.
