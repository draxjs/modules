# Setup

## Propósito

`setup` reúne utilidades de bootstrap para inicializar el módulo y sembrar datos básicos.

## Piezas principales

- `LoadIdentityConfigFromEnv()`: carga config sensible del módulo en `DraxConfig`.
- `LoadPermissions(permissions)`: registra permisos iniciales.
- `CreateUserIfNotExist(userData)`: crea usuarios semilla si no existen.
- `CreateTenantIfNotExist(tenantData)`: asegura tenants base.
- `CreateOrUpdateRole(roleData)`: crea o sincroniza roles con permisos.
- `RecoveryUserPassword(username, password)`: utilidad administrativa para restablecer contraseñas.

## Cuándo usarlo

Conviene en scripts de arranque, seeds o instalación inicial del sistema.
