# TenantMongoRepository

## Propósito

`TenantMongoRepository` implementa `ITenantRepository` sobre Mongo.

## Configuración

- `_model = TenantModel`
- `_searchFields = ['name']`
- `_populateFields = []`

## Métodos propios

- `findByName(name)`
- `findCursor(options)`
