# ZodErrorToValidationError

## Propósito

Convierte un `ZodError` en `ValidationError`.

## Qué hace

Traduce cada `issue` de Zod a `{ field, reason, value }` y usa el payload opcional para intentar recuperar el valor fallido.
