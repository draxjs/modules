# UserApiKeySqliteRepository

## Propósito

`UserApiKeySqliteRepository` implementa `IUserApiKeyRepository` sobre SQLite.

## Configuración

- `tableName = 'user_api_keys'`

## Overrides

- `findUserById`
- `prepareItem`
  - resuelve `user` y `createdBy`
  - parsea `ipv4` e `ipv6`
- `prepareData`
  - serializa `ipv4` e `ipv6`
- `findBySecret(secret)`
