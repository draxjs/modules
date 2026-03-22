# index

## Propósito

El `index.ts` de `i18n` compone el paquete final de mensajes exportados por `audit-front`.

## Cómo funciona

- importa `AuditI18n`
- importa `AuditActionsI18n`
- usa `merge.all()` de `deepmerge`
- exporta `AuditI18nMessages`
