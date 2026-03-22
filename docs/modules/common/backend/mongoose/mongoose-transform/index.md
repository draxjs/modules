# MongooseTransform

## Propósito

`MongooseTransform` define una transformación para serializar documentos.

## Qué hace

En `toObject()` agrega `id` a partir de `_id` y elimina `_id` del objeto retornado.
