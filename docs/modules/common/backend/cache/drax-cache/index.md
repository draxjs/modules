# DraxCache

## Propósito

`DraxCache` es la fachada de caché del backend. Decide en el constructor si usa Redis o un adapter local en memoria según `DraxConfig` y `CommonConfig`.

## Qué expone

- `set`, `get`, `has`, `delete` y `clear`
- `getOrLoad`, para poblar la caché ejecutando un loader async
- `isUsingRedis`, `isUsingFallback` y `getCacheStatus`, para inspeccionar el estado real del backend de caché
