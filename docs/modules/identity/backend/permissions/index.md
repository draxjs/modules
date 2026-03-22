# Permissions

## Propósito

`permissions` agrupa los permisos predefinidos por recurso y una exportación índice para cargarlos en conjunto.

## Piezas principales

- `UserPermissions`
- `RolePermissions`
- `TenantPermissions`
- `UserApiKeyPermissions`
- `UserSessionPermissions`
- `UserLoginFailPermissions`
- `index.ts`

Los permisos se usan tanto para seeds de roles como para validaciones RBAC en runtime.

## Cuándo usarlo

Conviene cuando querés poblar permisos del sistema o construir roles con una lista centralizada y reutilizable.
