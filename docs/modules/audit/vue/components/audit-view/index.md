# AuditView

## Propósito

`AuditView.vue` muestra una entrada de auditoría en formato legible para inspección detallada.

## Qué renderiza

- fecha formateada
- usuario, rol y recurso afectado
- entidad y acción con soporte i18n
- API key, IP, user agent, tenant, sesión y request
- `detail` en bloque destacado
- tabla compacta de `changes`

## Detalles

- usa `formatDateTime` de `@drax/common-front`
- usa `useI18n()` para traducir campos y acciones
- colorea `old` y `new` para facilitar comparación
