# Errors

## Propósito

`errors` define errores propios del dominio identidad que complementan la base de `@drax/common-back`.

## Piezas principales

- `BadCredentialsError`: representa autenticación fallida y se usa en `UserService.auth()` y `authByEmail()` cuando el usuario no existe, está inactivo o la contraseña no coincide.

## Cuándo usarlo

Sirve para separar credenciales inválidas de otros errores de validación o infraestructura y devolver una respuesta consistente a login y flujos relacionados.
