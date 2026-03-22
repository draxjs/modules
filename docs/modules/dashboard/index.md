# Dashboard

## Propósito

`dashboard` permite definir dashboards configurables en Drax, persistirlos en backend y renderizarlos en frontend y Vue mediante tarjetas de tipo `paginate` o `groupBy`.

## Submódulos disponibles

### Backend

Expone CRUD, schemas, permisos y repositorios para almacenar dashboards.

### Frontend

Publica el provider REST y los mensajes i18n del módulo.

### Share

Define los contratos TypeScript de dashboards y tarjetas.

### Vue

Incluye componentes de visualización y edición, rutas, store, composables y CRUD para integrar dashboards en UI.

## Cómo se relacionan

- `dashboard-share` define `IDashboard` e `IDashboardCard`.
- `dashboard-back` persiste dashboards y expone `/api/dashboard`.
- `dashboard-front` consume esa API y aporta i18n reutilizable.
- `dashboard-vue` usa entidades CRUD registradas para construir y renderizar tarjetas agrupadas o paginadas.
