# AuditSqliteRepository

## Propósito

`AuditSqliteRepository` implementa `IAuditRepository` sobre `AbstractSqliteRepository`.

## Estructura

- tabla `audits`
- identificador `_id`
- columnas texto para `user`, `changes`, `tenant` y `apiKey`
- timestamps `createdAt` y `updatedAt`

## Adaptaciones

- `prepareData()` serializa a JSON los campos compuestos antes de guardar
- `prepareItem()` deserializa esos campos al leer

## Cuándo usarlo

Es la implementación elegida cuando `DbEngine` está configurado en `SQLITE`.
