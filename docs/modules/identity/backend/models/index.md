# Models

## Propósito

`models` define los modelos Mongo y sus schemas para las entidades principales del módulo.

## Piezas principales

- `UserModel`
- `RoleModel`
- `TenantModel`
- `UserApiKeyModel`
- `UserSessionModel`
- `UserLoginFailModel`
- `UserGroupModel`

Cada archivo exporta tanto el modelo como el schema Mongo asociado, que luego usan los repositorios `mongo/*`.

## Cuándo usarlo

Usalo cuando integrás identidad con Mongoose o necesitás extender el schema de alguna entidad.
