# MongooseValidationErrorToValidationError

## Propósito

Convierte un `mongoose.Error.ValidationError` en `ValidationError`.

## Qué hace

Recorre `mongooseError.errors` y genera un `IValidationFieldError` por cada error de schema.
