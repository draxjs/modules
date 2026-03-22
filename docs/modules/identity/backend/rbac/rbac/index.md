# Rbac

## Propósito

`Rbac` implementa `IRbac` y encapsula la evaluación de autenticación, permisos, ownership de usuario y pertenencia a tenant.

## Estado interno

- `authUser`
- `role`

## Getters principales

- `getRole`
- `getAuthUser`
- `username`
- `userId`
- `session`
- `apiKeyId`
- `apiKeyName`
- `roleId`
- `roleName`
- `hasTenant`
- `tenantId`
- `tenantName`

## Métodos de autorización

- `assertAuthenticated()`
- `hasPermission(requiredPermission)`
- `hasSomePermission(requiredPermissions)`
- `assertPermission(requiredPermission)`
- `assertOrPermissions(requiredPermissions)`
- `assertUserId(userId)`
- `assertTenantId(tenantId)`

## Errores que lanza

- `UnauthorizedError`
- `ForbiddenError`

## Dónde se usa

- `rbacMiddleware`
- controladores de identidad
- `AbstractFastifyController` del módulo CRUD

## Cuándo usarlo

Conviene cuando querés un objeto único por request para validar permisos y ownership sin acoplarte al formato bruto del token.
