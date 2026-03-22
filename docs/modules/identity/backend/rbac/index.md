# RBAC

## Propósito

La carpeta encapsula la lógica de autorización basada en rol y contexto autenticado.

## Piezas principales

- `Rbac`: recibe `authUser` y `role`, y expone helpers como `hasPermission`, `hasSomePermission`, `assertPermission`, `assertAuthenticated`, `assertUserId` y `assertTenantId`.

## Cuándo usarlo

Usalo cuando una operación deba validar permisos concretos o restringirse al usuario/tenant autenticado actual.
