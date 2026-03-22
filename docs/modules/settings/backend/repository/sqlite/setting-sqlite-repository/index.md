# SettingSqliteRepository

## Propósito

`SettingSqliteRepository` implementa `ISettingRepository` sobre `AbstractSqliteRepository`.

## Particularidades

- tabla `settings`
- trata `public` como booleano
- serializa `options` a JSON
- convierte `value` según `type` para booleanos y listas
- expone `findByKey()` con SQL directo
- redefine `updatePartial()` para fusionar el item existente
