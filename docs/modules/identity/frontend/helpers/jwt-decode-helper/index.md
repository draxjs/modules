# JwtDecodeHelper

## Propósito

`JwtDecodeHelper.ts` decodifica JWTs sin verificar firma.

## Piezas principales

- `InvalidTokenError`
- tipos `JwtDecodeOptions`, `JwtHeader` y `JwtPayload`
- `jwtDecodeHelper`, que parsea el header o el payload desde base64url
