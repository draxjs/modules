# Interfaces

## Propósito

`interfaces` define contratos de providers y payloads consumidos por los systems y por `identity-vue`.

## Piezas principales

- Auth:
  - `IAuthProvider`
  - `ILoginResponse`
  - `IAuthFullUser`
  - `IUserRegistration`
  - `IUserPassword`
- CRUD y recursos:
  - `IUserProvider`
  - `IRoleProvider`
  - `ITenantProvider`
  - `IUserApiKeyProvider`
  - `IUserSessionProvider`
  - `IUserLoginFailProvider`

## Cuándo usarlo

Conviene cuando necesitás tipar integraciones con identidad sin depender de una implementación concreta REST o GraphQL.
