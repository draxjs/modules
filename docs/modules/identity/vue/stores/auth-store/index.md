# AuthStore

## Propósito

`AuthStore.ts` mantiene el estado autenticado de la aplicación.

## Qué hace

Guarda `accessToken` y `authUser`, expone getters como `isAuth`, `hasPermission` y `tokenIsValid`, y persiste el estado con `persist: true`.
