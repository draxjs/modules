# Errors

## Propósito

`errors` define errores propios del frontend de identidad por encima de la jerarquía común de `@drax/common-front`.

## Piezas principales

- `BadCredentialsError`: error específico para credenciales inválidas del flujo de login.

## Cuándo usarlo

Conviene cuando querés distinguir fallos de autenticación de otros `ClientError`, `ServerError` o `NetworkError`.
