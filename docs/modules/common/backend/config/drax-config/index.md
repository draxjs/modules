# DraxConfig

## Propósito

`DraxConfig` es un registro estático de configuración para Drax.

## Qué hace

- guarda y recupera valores en memoria
- parsea `string`, `number` y `boolean`
- carga desde `process.env` cuando la clave todavía no fue seteada
- permite pedir defaults con `getOrLoad`
