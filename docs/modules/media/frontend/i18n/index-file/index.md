# index

## Propósito

El `index.ts` de `i18n` compone todos los mensajes exportados por `media-front`.

## Cómo funciona

- importa `FileMessages`
- importa `MediaPermissionsMessages`
- usa `merge.all()` de `deepmerge`
