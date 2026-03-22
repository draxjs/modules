# AuditSchema

## Propósito

`AuditSchema` y `AuditBaseSchema` validan el payload de auditoría que usa el backend.

## Base

`AuditBaseSchema` exige:

- `entity`
- `user.id`
- `user.username`
- `action`

Y admite además `resourceId`, `ip`, `userAgent`, `changes`, `sessionId`, `requestId`, `detail`, `tenant` y `apiKey`.

## Extensión

`AuditSchema` agrega:

- `_id`
- `createdAt` como `z.iso.datetime()`
