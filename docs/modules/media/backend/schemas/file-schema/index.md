# FileSchema

## Propósito

`FileBaseSchema` y `FileSchema` validan la metadata de archivos.

## Base

`FileBaseSchema` exige:

- `filename`
- `relativePath`
- `absolutePath`
- `url`

Y además tipa descripción, tags, MIME, tamaño, TTL, visibilidad, autoría y tenant.

## Extensión

`FileSchema`:

- omite `absolutePath` en la forma pública
- agrega `_id`, `createdAt` y `updatedAt`
- modela `tenant`, `createdBy` y `updatedBy` con forma enriquecida
