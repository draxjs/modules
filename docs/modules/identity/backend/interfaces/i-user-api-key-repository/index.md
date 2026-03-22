# IUserApiKeyRepository

## Propósito

`IUserApiKeyRepository` define el contrato de persistencia de API keys.

## Extiende

- `IDraxCrudRepository<IUserApiKey, IUserApiKeyBase, IUserApiKeyBase>`

## Método específico

- `findBySecret(secret)`
