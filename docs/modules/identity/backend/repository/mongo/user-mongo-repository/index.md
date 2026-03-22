# UserMongoRepository

## Propósito

`UserMongoRepository` implementa `IUserRepository` sobre Mongo y agrega búsquedas sensibles que la base CRUD no cubre.

## Configuración

- `_model = UserModel`
- `_searchFields = ['name', 'username', 'email', 'phone']`
- `_populateFields` incluye `role` y `tenant`

## Métodos propios

- `create(userData)`
  - valida que el rol exista antes de crear
- `findByUsername`
- `findByUsernameWithPassword`
- `findByIdWithPassword`
- `findByEmail`
- `findByEmailCode`
- `findByPhoneCode`
- `findByRecoveryCode`
- `changePassword`
- `changeAvatar`
- `findCursor`
