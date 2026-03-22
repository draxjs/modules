# ValidationError

## Propósito

`ValidationError` agrupa varios errores de validación de campo.

## Detalles

Expone `errors: IValidationFieldError[]`, responde con `422` y publica `inputErrors` en el `body` para que HTTP y GraphQL puedan reutilizar el mismo formato.
