# AuditMongoRepository

## Propósito

`AuditMongoRepository` implementa `IAuditRepository` sobre `AbstractMongoRepository`.

## Configuración

- usa `AuditModel` como `_model`
- permite búsqueda por `entity`, `action`, `sessionId` y `requestId`
- no configura `populateFields`

## Cuándo usarlo

Es la opción elegida por la factory cuando Drax corre con MongoDB.
