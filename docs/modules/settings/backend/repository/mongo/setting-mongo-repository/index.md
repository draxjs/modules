# SettingMongoRepository

## Propósito

`SettingMongoRepository` implementa `ISettingRepository` sobre `AbstractMongoRepository`.

## Configuración

- usa `SettingModel` como `_model`
- habilita búsqueda por `_id` y `key`
- no define `populateFields`
