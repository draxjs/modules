# rbacMiddleware

## Propósito

`rbacMiddleware` transforma `request.authUser` en una instancia concreta de `Rbac`.

## Flujo

- si existe `authUser`
  - usa `roleId` como cache key
  - carga el rol con `RoleServiceFactory().findById`
  - cachea con `DraxCache<IRole>` y TTL `DRAX_RBAC_CACHE_TTL`
  - crea `new Rbac(authUser, role)`
- si no existe `authUser`
  - crea `new Rbac(null, null)`

## Resultado

Setea `request.rbac` y `reply.rbac`.

## Cuándo usarlo

Conviene cuando querés que todo el backend trabaje contra la abstracción `IRbac` y no contra el token plano.
