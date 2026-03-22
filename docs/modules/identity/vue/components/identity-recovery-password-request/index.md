# IdentityRecoveryPasswordRequest

## Propósito

`IdentityRecoveryPasswordRequest.vue` implementa la solicitud inicial de recuperación.

## Qué hace

Pide email, valida formato con regex y llama `useAuth().recoveryPasswordRequest()`, mostrando un mensaje informativo al completar.
