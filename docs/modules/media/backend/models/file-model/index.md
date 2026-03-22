# FileModel

## Propósito

`FileModel` persiste la metadata de archivos en Mongo.

## Estructura

- guarda rutas, URL, descripción, tags, MIME y tamaño
- registra `createdBy`, `updatedBy`, `tenant`
- soporta `ttlSeconds`, `expiresAt`, `isPublic` y `hits`

## Detalles

- aplica `mongoose-paginate-v2`
- aplica `mongoose-unique-validator`
- genera `expiresAt` automáticamente en `pre('validate')` cuando existe `ttlSeconds`
- define la virtual `id`
