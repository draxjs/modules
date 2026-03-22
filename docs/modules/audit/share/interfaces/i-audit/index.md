# IAudit

## Propósito

`IAudit` e `IAuditBase` describen una entrada de auditoría compartida por todos los submódulos.

## Campos principales

- `entity`, `resourceId`, `action`
- `user.id`, `user.username`, `user.rolName`
- `ip`, `userAgent`
- `changes[]` con `field`, `old` y `new`
- `sessionId`, `requestId`, `detail`
- `tenant`, `apiKey`
- `createdAt`, `updatedAt`

## Diferencia entre tipos

- `IAuditBase` representa el payload sin identificador persistido
- `IAudit` agrega `_id`
