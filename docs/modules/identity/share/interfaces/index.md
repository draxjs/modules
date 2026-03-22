# Interfaces

## Propósito

La carpeta define los tipos nucleares del dominio identidad.

## Piezas principales

- `IAuthUser`: payload autenticado mínimo para JWT y contexto de request.
- `IJwtUser`: forma del usuario serializado en token.
- `IRbac`: contrato del objeto de autorización.
- `IUser`, `IUserCreate`, `IUserUpdate`, `IUserEmailCreate`
- `IRole`, `IRoleBase`, `IRolePermissions`
- `ITenant`, `ITenantBase`
- `IUserApiKey`, `IUserApiKeyBase`, `IUserApiKeySoftDelete`
- `IUserSession`, `IUserSessionBase`
- `IUserLoginFail`, `IUserLoginFailBase`
- `IUserGroup`, `IUserGroupBase`

## Cuándo usarlo

Conviene para mantener alineadas las entidades del dominio entre almacenamiento, transporte y presentación.
