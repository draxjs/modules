# LocalCacheAdapter

## Propósito

`LocalCacheAdapter` implementa `ICacheAdapter` con `Map` en memoria y expiración por `setTimeout`.

## Qué hace

Guarda valores por clave, limpia timers al sobrescribir o borrar y permite vaciar toda la caché local sin dependencias externas.
