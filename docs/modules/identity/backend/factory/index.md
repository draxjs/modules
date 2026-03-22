# Factory

## Propósito

La carpeta reúne factories que instancian servicios de identidad con el repositorio correcto según `DRAX_DB_ENGINE`.

## Piezas principales

- `UserServiceFactory`
- `RoleServiceFactory`
- `TenantServiceFactory`
- `UserApiKeyServiceFactory`
- `UserSessionServiceFactory`
- `UserLoginFailServiceFactory`

Cada factory selecciona repositorios Mongo o SQLite, carga configuración compartida desde `@drax/common-back` y devuelve la instancia de servicio lista para usarse.

## Cuándo usarlo

Conviene cuando querés desacoplar controladores, resolvers o setup del detalle del motor de persistencia.
