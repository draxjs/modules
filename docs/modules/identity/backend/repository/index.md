# Repository

## Propósito

`repository` implementa persistencia para el dominio identidad sobre MongoDB y SQLite.

## Piezas principales

- Subcarpeta `mongo`:
  - `UserMongoRepository`
  - `RoleMongoRepository`
  - `TenantMongoRepository`
  - `UserApiKeyMongoRepository`
  - `UserSessionMongoRepository`
  - `UserLoginFailMongoRepository`
- Subcarpeta `sqlite`:
  - `UserSqliteRepository`
  - `RoleSqliteRepository`
  - `TenantSqliteRepository`
  - `UserApiKeySqliteRepository`
  - `UserSessionSqliteRepository`
  - `UserLoginFailSqliteRepository`

## Cuándo usarlo

Sirve cuando necesitás persistencia concreta o querés revisar cómo cada agregado implementa búsquedas, paginación y operaciones de seguridad en cada motor.
