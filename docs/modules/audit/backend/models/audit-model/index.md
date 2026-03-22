# AuditModel

## Propósito

`AuditModel` persiste entradas de auditoría en Mongo usando Mongoose y `mongoose-paginate-v2`.

## Campos relevantes

- `entity`, `resourceId`
- `user.id`, `user.username`, `user.rolName`
- `action`, `ip`, `userAgent`
- `changes[]`
- `sessionId`, `requestId`, `detail`
- `tenant`, `apiKey`
- timestamps automáticos

## Detalles de implementación

- aplica `uniqueValidator`
- aplica `mongoosePaginate`
- define virtual `id` desde `_id`
- exporta el modelo con nombre y colección `Audit`
