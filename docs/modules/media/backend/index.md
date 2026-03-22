# Media Backend

## Propósito

`media-back` implementa el backend del módulo: carga y descarga de archivos, CRUD de metadata y repositorios para Mongo o SQLite.

## Secciones

- `controllers`: capa HTTP para metadata y transferencias.
- `factory`: construcción del servicio según la base configurada.
- `interfaces`: contratos del dominio archivo.
- `models`: schema y modelo Mongo.
- `permissions`: permisos de CRUD y upload.
- `repository`: implementaciones Mongo y SQLite.
- `routes`: endpoints Fastify para metadata y contenido binario.
- `schemas`: validación Zod del recurso.
- `services`: lógica de negocio sobre archivos.

## Cuándo usarlo

Usalo cuando el sistema necesite almacenar metadata de archivos y servir uploads/downloads controlados por permisos.
