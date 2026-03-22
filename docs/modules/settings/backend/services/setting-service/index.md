# SettingService

## Propósito

`SettingService` extiende `AbstractService` y agrega operaciones específicas del dominio settings.

## Qué hace

- `cache()` y `cacheValue()` con `DraxCache`
- `findByKey()`
- `fetchAll()`
- `fetchGrouped()` por categoría
- `updateValue()` validando `regex`
- `create()`, `update()` y `createOrUpdate()` con validación Zod y adaptación de arrays
