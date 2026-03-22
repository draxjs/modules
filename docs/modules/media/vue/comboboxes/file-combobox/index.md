# FileCombobox

## Propósito

`FileCombobox.vue` permite buscar y seleccionar archivos existentes desde UI.

## Qué hace

- define un campo `ref` compatible con `CrudAutocomplete`
- usa `FileEntityCrud.instance` como entidad fuente
- expone `v-model` y múltiples props visuales de Vuetify
