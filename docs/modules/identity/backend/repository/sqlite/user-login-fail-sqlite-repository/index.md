# UserLoginFailSqliteRepository

## Propósito

`UserLoginFailSqliteRepository` implementa `IUserLoginFailRepository` sobre SQLite.

## Configuración

- `tableName = 'user_login_fails'`
- `populateFields = [{ field: 'user', table: 'users', identifier: '_id' }]`

## Overrides

- `prepareData`
- `prepareItem`

Ambos existen aunque hoy no agregan lógica compleja.
