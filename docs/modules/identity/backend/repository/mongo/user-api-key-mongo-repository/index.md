# UserApiKeyMongoRepository

## Propósito

`UserApiKeyMongoRepository` implementa `IUserApiKeyRepository` sobre Mongo.

## Configuración

- `_model = UserApiKeyModel`
- `_searchFields = ['name']`
- `_populateFields` incluye `user`, `user.tenant`, `user.role`, `createdBy`

## Métodos propios

- `delete(id)`
  - usa soft delete sobre el documento
- `findBySecret(secret)`
  - busca por secreto hash y `deleted != true`
- `paginate(options)`
  - fuerza populate completo para usuario y creador
