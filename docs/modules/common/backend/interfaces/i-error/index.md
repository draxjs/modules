# IError

## Propósito

`IError` define la forma común de los errores backend expuestos por Drax.

## Qué exige

`statusCode`, `name`, `message`, `i18nMessage` y un `body` serializable que opcionalmente puede incluir `inputErrors`.
