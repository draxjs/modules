# IAuditRepository

## Propósito

`IAuditRepository` formaliza el contrato del repositorio usado por el servicio de auditoría.

## Base

- extiende `IDraxCrudRepository<IAudit, IAuditBase, IAuditBase>`

## Qué implica

Las implementaciones deben soportar las operaciones CRUD genéricas y devolver elementos del dominio `audit`.
