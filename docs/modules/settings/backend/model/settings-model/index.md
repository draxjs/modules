# SettingsModel

## Propósito

`SettingSchema` y `SettingModel` persisten variables de configuración en Mongo.

## Campos principales

- `key`, `value`, `label`, `description`, `category`
- `type`, `options`, `regex`
- `entity`, `entityValue`, `entityText`
- `prefix`, `suffix`
- `permission`, `public`, `updatedBy`

## Detalles

- `key` es único
- usa `mongoose-lean-virtuals`
- genera la virtual `id`
- persiste en la colección `settings`
