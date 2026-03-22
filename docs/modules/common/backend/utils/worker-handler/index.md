# WorkerHandler

## Propósito

`WorkerHandler` ejecuta un archivo worker y devuelve una `Promise`.

## Qué hace

Resuelve con el mensaje recibido del worker y rechaza por error o por exit code distinto de `0`.
