# SettingTableConfig

## Propósito

`SettingTableConfig.vue` presenta settings agrupados en una tabla con búsqueda y edición inline mediante modal.

## Qué hace

- filtra por `key` y `description`
- muestra valor con formato según `type`
- oculta o revela secretos
- usa `CrudAutocomplete` readonly para refs
- abre `SettingEditor` para modificar el valor
