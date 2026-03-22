# SettingRoutes

## Propósito

`SettingRoutes.ts` declara las rutas Vue Router del módulo.

## Rutas

- `/settings` -> `SettingPage`
- `/settings/card` -> `SettingCardPage`
- `/settings/av` -> `SettingAvPage`

## Seguridad

Todas requieren:

- `meta.auth = true`
- `meta.permission = 'setting:manage'`
