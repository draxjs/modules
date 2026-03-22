# Combobox

## Propósito

`combobox` contiene selectores reutilizables conectados al dominio identidad.

## Piezas principales

- `RoleCombobox`: carga roles con `useRole()`.
- `TenantCombobox`: carga tenants con `useTenant()`.
- `PermissionCombobox`: lista permisos disponibles usando `useRole().fetchPermissions()`.

## Cuándo usarlo

Conviene en formularios de usuario, rol o tenant donde necesitás seleccionar entidades relacionadas o permisos.
