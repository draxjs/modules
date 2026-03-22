# IsValidObjectId

## Propósito

`isValidObjectId` valida strings candidatas a `ObjectId`.

## Qué hace

Exige 24 caracteres hexadecimales y luego delega la validación final a `ObjectId.isValid`.
