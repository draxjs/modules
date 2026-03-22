# Schemas

## Propósito

`schemas` define validación y shape de entrada/salida para entidades y flujos de auth.

## Piezas principales

- Entidades:
  - `UserSchema`, `UserBaseSchema`, `UserCreateSchema`, `UserUpdateSchema`
  - `RoleSchema`, `RoleBaseSchema`
  - `TenantSchema`, `TenantBaseSchema`
  - `UserApiKeySchema`, `UserApiKeyBaseSchema`
  - `UserSessionSchema`, `UserSessionBaseSchema`
  - `UserLoginFailSchema`, `UserLoginFailBaseSchema`
- Auth y seguridad:
  - `LoginSchema`
  - `RegisterSchema`
  - `PasswordSchema`
  - `SwitchTenantSchema`
  - `TokenPayloadSchema`

## Cuándo usarlo

Conviene cuando querés validar payloads con Zod o reutilizar definiciones de entrada/salida entre controladores y servicios.
