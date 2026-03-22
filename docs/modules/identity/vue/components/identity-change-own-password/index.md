# IdentityChangeOwnPassword

## Propósito

`IdentityChangeOwnPassword.vue` implementa el formulario para que el usuario autenticado cambie su propia contraseña.

## Qué hace

Usa `useAuth().changeOwnPassword()`, valida confirmación de password y muestra `inputErrors` traducidos con `useI18nValidation`.
