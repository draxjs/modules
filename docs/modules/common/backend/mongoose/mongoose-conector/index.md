# MongooseConector

## Propósito

`MongooseConector` encapsula la conexión de Mongoose con validación básica de URI y reconexión automática.

## Qué hace

Registra handlers para `open`, `error` y `disconnected`, y vuelve a intentar la conexión luego de `reconnectionTime`.
