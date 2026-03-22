# Stores

## Propósito

`stores` centraliza el estado reactivo del módulo con Pinia.

## Piezas principales

- `AuthStore`: persiste `accessToken` y `authUser`, y expone getters como `isAuth`, `hasPermission` y `tokenIsValid`.
- `IdentityCrudStore`: registra las definiciones CRUD del módulo para que páginas y formularios trabajen sobre una única fuente de verdad.

## Cuándo usarlo

Usalo cuando quieras compartir sesión autenticada o metadata CRUD entre páginas y componentes.
