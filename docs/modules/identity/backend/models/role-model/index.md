# RoleModel

## Propósito

`RoleModel` define el schema Mongoose de roles.

## Campos principales

- `name` único e indexado
- `permissions`
- `icon`
- `color`
- `childRoles` como refs a `Role`
- `readonly`

## Plugins

- `mongoose-unique-validator`
- `MongooseSoftDelete`
- `mongoose-paginate-v2`

## Particularidades

- expone virtual `id`
- usa colección `roles`
