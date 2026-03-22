# Services

## Propósito

`services` contiene la factory concreta del servicio de auditoría.

## Piezas principales

- `AuditServiceFactory`: selecciona repositorio Mongo o SQLite y devuelve una instancia singleton de `AuditService`.
