# Audit

## Propósito

`audit` centraliza el registro y la consulta de eventos de auditoría en Drax: quién hizo una acción, sobre qué entidad, qué cambió y en qué contexto ocurrió.

## Submódulos disponibles

### Backend

Expone persistencia, schemas, rutas Fastify, permisos y utilidades para registrar eventos CRUD como entradas de auditoría.

### Frontend

Publica el provider REST y los mensajes i18n para consumir auditoría desde clientes TypeScript.

### Share

Define los contratos compartidos de una entrada de auditoría y su payload base.

### Vue

Incluye componentes, definición CRUD, dashboard y rutas listas para visualizar auditoría en aplicaciones Vue.

## Cómo se relacionan

- `audit-share` define la forma del registro de auditoría.
- `audit-back` persiste eventos y los expone por API.
- `audit-front` consume `/api/audits` y publica textos traducibles.
- `audit-vue` monta la experiencia de consulta y dashboard usando el provider frontend.
