# AuthHelper

## Propósito

`AuthHelper` valida la vigencia básica de un JWT en el navegador.

## Qué hace

Decodifica el token con `jwtDecodeHelper`, verifica `exp` y compara la expiración contra la fecha actual.
