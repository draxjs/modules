# CommonController

## Propósito

`CommonController` centraliza la traducción de excepciones backend a respuestas HTTP.

## Qué hace

Si recibe un error conocido de la jerarquía `common-back`, responde con su `statusCode` y `body`. Si no, devuelve un `InternalServerError` como fallback.
