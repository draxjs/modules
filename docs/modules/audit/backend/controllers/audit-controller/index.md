# AuditController

## Propósito

`AuditController` adapta `AbstractFastifyController` al dominio de auditoría y deja el recurso en modo solo lectura.

## Base

- hereda de `AbstractFastifyController<IAudit, IAuditBase, IAuditBase>`
- usa `AuditServiceFactory.instance`
- usa `AuditPermissions`
- fija `tenantField = 'tenant.id'`
- fija `userField = 'user'`
- activa `tenantFilter = true`
- desactiva `userFilter`, `tenantSetter`, `userSetter`, `tenantAssert` y `userAssert`

## Restricciones

- `create`
- `update`
- `updatePartial`
- `delete`

Todas lanzan `MethodNotAllowedError`, por lo que la auditoría no se modifica desde la API CRUD estándar.
