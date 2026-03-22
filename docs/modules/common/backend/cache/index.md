# Cache

## Propósito

La sección de caché ofrece una única API para guardar y recuperar valores con TTL, usando memoria local o Redis según la configuración cargada en `DraxConfig`.

## Piezas principales

- `DraxCache<T>` decide el adapter activo a partir de `DRAX_CACHE_REDIS_URL` y `DRAX_CACHE_TTL`.
- `LocalCacheAdapter<T>` resuelve almacenamiento en memoria para desarrollo o fallback.
- `RedisCacheAdapter<T>` intenta trabajar contra Redis y expone estado de conexión/fallback.

## Cuándo usarlo

Es útil para memoizar resultados costosos o envolver cargas perezosas con `getOrLoad`.

## Ejemplo

```ts
import { DraxCache } from '@drax/common-back'

const cache = new DraxCache<string>(60000)
const value = await cache.getOrLoad('health', async () => 'ok')
```
