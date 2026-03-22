# UserModel

## Propósito

`UserModel` define el schema Mongoose principal de usuarios.

## Campos principales

- `username` único con validación alfanumérica
- `email` único con validación de formato
- `password` con `select: false`
- `name`
- `active`
- `phone`
- `avatar`
- `role` ref a `Role`
- `tenant` ref a `Tenant`
- `origin`
- `groups[]`
- flags y códigos de verificación / recovery

## Plugins

- `mongoose-unique-validator`
- `MongooseSoftDelete`
- `mongoose-paginate-v2`
