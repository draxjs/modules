# Dashboard Backend

## Propósito

`dashboard-back` implementa la persistencia y exposición HTTP del módulo de dashboards.

## Secciones

- `controllers`: adapta el controlador CRUD al dominio dashboard.
- `factory`: crea el servicio según el motor configurado.
- `interfaces`: contrato de repositorio.
- `models`: schema y modelo Mongo.
- `permissions`: permisos del recurso.
- `repository`: implementaciones Mongo y SQLite.
- `routes`: endpoints CRUD y consultas auxiliares.
- `schemas`: validación Zod del dashboard.
- `services`: capa de servicio.

## Cuándo usarlo

Usalo cuando quieras almacenar dashboards personalizados y recuperarlos por API para configuración o visualización.
