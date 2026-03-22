# Setup

## Propósito

`setup` agrupa funciones de inicialización para cargar configuración común al arrancar la aplicación.

## Piezas principales

- `LoadCommonConfigFromEnv()` lee las claves listadas en `CommonConfig` y las deja disponibles a través de `DraxConfig`.

## Cuándo usarlo

Se usa temprano en el bootstrap del backend para que caché, storage y persistencia lean valores ya normalizados.
