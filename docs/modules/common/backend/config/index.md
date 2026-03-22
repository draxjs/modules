# Config

## Propósito

`config` centraliza las claves de entorno del módulo y el acceso tipado a valores de configuración en memoria.

## Piezas principales

- `CommonConfig` enumera claves como `DRAX_DB_ENGINE`, `DRAX_SQLITE_FILE`, `DRAX_MONGO_URI`, `DRAX_BASE_URL`, `DRAX_FILE_DIR`, `DRAX_MAX_UPLOAD_SIZE`, `DRAX_CACHE_TTL` y `DRAX_CACHE_REDIS_URL`.
- `DraxConfig` permite `get`, `set`, `getAll` y `getOrLoad`, con parseo de `string`, `number` y `boolean`.

## Cuándo usarlo

Conviene cuando un servicio necesita leer configuración una sola vez y reutilizarla con tipo consistente, sin acceder directo a `process.env` en todo el código.
