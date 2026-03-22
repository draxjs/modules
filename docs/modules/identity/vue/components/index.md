# Components

## Propósito

La carpeta agrupa componentes de alto valor funcional para login, perfil, recuperación y selección de permisos.

## Piezas principales

- `IdentityLogin`
- `IdentityRegistration`
- `IdentityRecoveryPasswordRequest`
- `IdentityRecoveryPasswordComplete`
- `IdentityChangeOwnPassword`
- `IdentityProfileAvatar`
- `IdentityProfileAvatarEdit`
- `IdentityProfileDrawer`
- `IdentityProfileView`
- `SwitchTenant`
- `PermissionSelector`
- `IdentityUserGroupBy`

Estos componentes suelen apoyarse en `useAuth`, `useRole`, stores Pinia e i18n para quedar listos para incrustar.

## Cuándo usarlo

Usalo cuando quieras montar flujos de auth o administración sin construir formularios y wiring desde cero.
