# Settings Backend

## Propósito

`settings-back` implementa la consulta y actualización de variables de configuración del sistema.

## Secciones

- `controller`: endpoints de lectura agrupada, lectura por clave y update de valor.
- `factory`: creación del servicio según el motor configurado.
- `interfaces`: contrato del repositorio.
- `model`: schema y modelo Mongo.
- `permissions`: catálogo de permisos del módulo.
- `repository`: implementaciones Mongo y SQLite.
- `routes`: registro Fastify.
- `schemas`: validación Zod del recurso.
- `services`: lógica de negocio y cache.

## Cuándo usarlo

Usalo cuando necesitás administrar configuración dinámica del sistema sin redeploy.
