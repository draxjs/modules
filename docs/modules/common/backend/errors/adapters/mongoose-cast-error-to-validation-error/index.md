# MongooseCastErrorToValidationError

## Propósito

Convierte un `mongoose.Error.CastError` en `ValidationError`.

## Qué mapea

Usa `path`, `message` y `value` del error de Mongoose para construir un único `IValidationFieldError`.
