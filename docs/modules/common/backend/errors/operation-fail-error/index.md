# OperationFailError

## Propósito

`OperationFailError` modela fallos operativos genéricos del servidor.

## Detalles

Responde con `500`, conserva el mensaje pasado al constructor y usa `error.operation_failed` como clave i18n.
