# Audit Backend

## Propósito

`audit-back` implementa el backend del módulo de auditoría: recibe eventos CRUD, calcula diferencias, persiste entradas y expone endpoints de lectura, agrupación y exportación.

## Secciones

- `controllers`: restringe operaciones mutables y reutiliza el controlador CRUD para lecturas.
- `factory`: instancia el servicio según el motor configurado.
- `interfaces`: contrato del repositorio de auditoría.
- `models`: schema y modelo Mongo.
- `permissions`: catálogo de permisos del módulo.
- `repository`: implementaciones Mongo y SQLite.
- `routes`: registro Fastify de endpoints `/api/audits`.
- `schemas`: validación Zod del payload de auditoría.
- `services`: capa de servicio sobre el repositorio.
- `utils`: helper para registrar eventos CRUD como auditoría.

## Cuándo usarlo

Usalo cuando quieras capturar trazabilidad de operaciones de negocio y consultarla luego desde API o dashboard.
