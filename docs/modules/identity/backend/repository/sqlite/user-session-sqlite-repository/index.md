# UserSessionSqliteRepository

## Propósito

`UserSessionSqliteRepository` implementa `IUserSessionRepository` sobre SQLite.

## Configuración

- `tableName = 'user_sessions'`
- `populateFields = [{ field: 'user', table: 'users', identifier: '_id' }]`

## Overrides

- `prepareData`
- `prepareItem`
