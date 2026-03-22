# UserApiKeyModel

## Propósito

`UserApiKeyModel` define el schema Mongoose de API keys de usuario.

## Campos

- `name`
- `secret` indexado
- `user` ref a `User`
- `ipv4[]`
- `ipv6[]`
- `createdBy` ref a `User`

## Plugins

- `mongoose-unique-validator`
- `MongooseSoftDelete`
- `mongoose-paginate-v2`
