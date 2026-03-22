# UserGroupModel

## Propósito

`UserGroupModel` define el schema Mongoose de grupos de usuarios.

## Campos

- `name` único con validación alfanumérica con espacios
- `users[]` refs a `User`

## Plugins

- `mongoose-unique-validator`
- `MongooseSoftDelete`
- `mongoose-paginate-v2`
