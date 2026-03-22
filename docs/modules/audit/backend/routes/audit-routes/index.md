# AuditRoutes

## Propósito

`AuditRoutes` publica la API HTTP del módulo en `/api/audits`.

## Endpoints

- `GET /api/audits`
- `GET /api/audits/find`
- `GET /api/audits/search`
- `GET /api/audits/:id`
- `GET /api/audits/find-one`
- `GET /api/audits/group-by`
- `GET /api/audits/export`

## Detalles

- instancia `AuditController`
- usa `CrudSchemaBuilder(AuditSchema, AuditBaseSchema, AuditBaseSchema, 'Audit', 'openapi-3.0', ['Audit'])`
- no registra endpoints de create, update ni delete
