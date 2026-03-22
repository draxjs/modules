# UserSqliteRepository

## Propósito

`UserSqliteRepository` implementa `IUserRepository` sobre SQLite.

## Configuración

- `tableName = 'users'`
- `booleanFields = ['active']`

## Overrides y métodos propios

- `prepareData`
  - hashea password
- `prepareItem`
  - resuelve `role` y `tenant`
- `updatePartial`
- `findByUsername`
- `findByUsernameWithPassword`
- `findByIdWithPassword`
- `findByEmail`
- `findByEmailCode`
- `findByRecoveryCode`
- `findByPhoneCode`
- `findRoleById`
- `findTenantById`
- `changePassword`
- `changeAvatar`
