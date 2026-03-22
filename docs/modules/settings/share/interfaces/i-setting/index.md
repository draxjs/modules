# ISetting

## Propósito

`ISetting`, `ISettingBase` y `SettingTypes` describen la estructura compartida del módulo.

## SettingTypes

Soporta:

- `string`
- `longString`
- `number`
- `enum`
- `boolean`
- `password`
- `stringList`
- `numberList`
- `enumList`
- `ref`
- `secret`

## Tipos principales

- `ISettingBase`: payload base del setting
- `ISetting`: versión persistida con `_id`
