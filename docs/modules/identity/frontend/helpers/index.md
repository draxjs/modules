# Helpers

## Propósito

`helpers` aporta utilidades de autenticación del lado cliente.

## Piezas principales

- `AuthHelper`: validación y utilidades asociadas al JWT almacenado en cliente.
- `jwtDecodeHelper`: decode de tokens JWT y tipos auxiliares como `JwtPayload`, `JwtHeader` e `InvalidTokenError`.

## Cuándo usarlo

Conviene para verificar expiración de tokens, inspeccionar claims o construir estados de sesión en el navegador.
