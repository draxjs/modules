# permissions/index

## Propósito

El `index.ts` de `permissions` consolida todos los enums de permisos del módulo identidad en un solo objeto.

## Qué combina

- `TenantPermissions`
- `UserPermissions`
- `RolePermissions`
- `UserApiKeyPermissions`
- `UserLoginFailPermissions`
- `UserSessionPermissions`

## Resultado

Exporta `permissions`, útil para registrar o cargar todos los permisos disponibles de una vez.
