# RecoveryUserPassword

## Propósito

`RecoveryUserPassword` cambia la contraseña de un usuario por `username`.

## Qué hace

- busca el usuario por `username`
- llama `userService.changeUserPassword`
- loguea la operación en consola
