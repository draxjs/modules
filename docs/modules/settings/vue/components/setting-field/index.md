# SettingField

## Propósito

`SettingField.vue` resuelve el control visual concreto según `setting.type`.

## Tipos cubiertos

- `string`, `longString`
- `password`, `secret`
- `number`, `boolean`
- `enum`
- `stringList`, `numberList`, `enumList`
- `ref`

## Detalles

- aplica validación regex cuando existe `setting.regex`
- usa `CrudAutocomplete` para settings de tipo `ref`
- soporta modo readonly y modo edición
