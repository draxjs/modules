# Providers

## Propósito

`providers` implementa el acceso real a la API de identidad sobre REST y GraphQL.

## Piezas principales

- Subcarpeta `rest`:
  - `AuthRestProvider`
  - `UserRestProvider`
  - `RoleRestProvider`
  - `TenantRestProvider`
  - `UserApiKeyRestProvider`
  - `UserSessionRestProvider`
  - `UserLoginFailRestProvider`
- Subcarpeta `gql`:
  - `AuthGqlProvider`
  - `UserGqlProvider`
  - `RoleGqlProvider`
  - `TenantGqlProvider`
  - `UserApiKeyGqlProvider`
  - `UserSessionGqlProvider`
  - `UserLoginFailGqlProvider`

`AuthRestProvider`, por ejemplo, maneja login, `me`, cambio de tenant, cambio de contraseña, recovery, registro y avatar, delegando en el cliente HTTP común.

## Cuándo usarlo

Usalo cuando quieras integrar identidad con una API concreta o extender un provider existente.
