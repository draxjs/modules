# SwitchTenant

## Propósito

`SwitchTenant.vue` permite cambiar el tenant activo del usuario.

## Qué hace

Muestra el tenant actual desde `AuthStore`, reutiliza `TenantCombobox` y ejecuta `useAuth().switchTenant()` seguido de `window.location.reload()`.
