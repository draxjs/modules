# Cruds

## Propósito

La carpeta reúne definiciones CRUD y formularios especializados para las entidades de identidad.

## Piezas principales

- Definiciones:
  - `UserCrud`
  - `RoleCrud`
  - `TenantCrud`
  - `UserApiKeyCrud`
  - `UserSessionCrud`
  - `UserLoginFailCrud`
- Formularios y componentes auxiliares:
  - `UserForm`
  - `RoleForm`
  - `UserApiKeyForm`
  - `UserPasswordForm`
  - `UserPasswordDialog`
  - `PasswordUpdateButton`
  - `UserApiKeyCreated`

Estas piezas se integran con `@drax/crud-share`, `useIdentityCrudStore` y los views/pages del módulo.

## Cuándo usarlo

Conviene cuando querés montar pantallas CRUD con headers, filtros, forms y validaciones coherentes con el resto del ecosistema Drax.
