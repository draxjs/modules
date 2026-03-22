# useSetting

## Propósito

`useSetting()` centraliza el acceso reactivo a los settings del sistema.

## Qué expone

- `fetchSettings()`
- `suscribeAuth()`
- `updateSettingValue()`
- `settings`
- `settingsGrouped`
- `settingValue(key)`
- `loading`

## Integraciones

- usa `useSettingStore()`
- usa `SettingProviderFactory.getInstance()`
- reacciona a login/logout vía `useAuthStore()` para refrescar settings visibles
