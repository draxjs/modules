# AuditCrud

## Propósito

`AuditCrud` describe cómo debe comportarse la entidad Audit dentro de `@drax/crud-vue`.

## Configuración relevante

- `name = 'Audit'`
- provider: `AuditProvider.instance`
- permisos: `audit:manage`, `audit:view`, `audit:create`, `audit:update`, `audit:delete`
- `searchEnable = false`
- `isViewable = true`
- `isEditable = false`
- `isCreatable = false`
- `isDeletable = false`
- `isExportable = true`
- `isGroupable = true`
- `isColumnSelectable = true`

## Qué define

- headers para fecha, acción, entidad, tenant, usuario y metadatos técnicos
- fields para objetos anidados como `user`, `changes` y `tenant`
- filtros por acción, entidad, tenant, usuario, IP y user agent
- formatos de exportación `CSV` y `JSON`
