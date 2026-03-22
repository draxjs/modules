# TenantServiceFactory

## Propósito

`TenantServiceFactory` crea o reutiliza una instancia singleton de `TenantService`.

## Persistencia

- `TenantMongoRepository` para MongoDB
- `TenantSqliteRepository` para SQLite, con `build()`
