# RedisCacheAdapter

## Propósito

`RedisCacheAdapter` implementa `ICacheAdapter` usando `redis`, pero mantiene un `LocalCacheAdapter` como fallback cuando la conexión falla.

## Qué resuelve

- conexión y reconexión controlada a Redis
- health checks periódicos
- serialización JSON de valores
- degradación automática a caché local cuando Redis no está disponible
