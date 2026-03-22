# MongoServerErrorToValidationError

## Propósito

Convierte un `MongoServerError` en `ValidationError`.

## Qué hace

Lee `keyValue`, extrae el campo afectado y arma la razón como `validation.<codeName>`.
