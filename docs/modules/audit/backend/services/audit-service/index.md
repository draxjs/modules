# AuditService

## Propósito

`AuditService` envuelve el repositorio `IAuditRepository` y reutiliza la infraestructura CRUD genérica para auditoría.

## Base

- hereda de `AbstractService<IAudit, IAuditBase, IAuditBase>`
- recibe repositorio y schema Zod opcional por constructor

## Rol en el módulo

No agrega reglas propias; funciona como punto de extensión y como dependencia central de controller y factory.
