# Generator

## Propósito

La carpeta `generator` concentra la ejecución completa de Arch. Desde acá se decide qué archivos se escriben y qué forma tiene cada artefacto generado.

## Piezas principales

- `ArchGenerator`: recorre las entidades y dispara cada template.
- `helpers`: lectura, creación de directorios y escritura de archivos.
- `templates`: plantillas que traducen un `IEntitySchema` a código backend, frontend y contratos compartidos.

## Salida que produce

Por cada entidad, el generador escribe archivos en:

- `output/<modulo>/back/interfaces`, `schemas`, `models`, `permissions`, `repository`, `services`, `factory/services`, `controllers` y `routes`.
- `output/<modulo>/front/interfaces`, `providers`, `cruds`, `components/cruds`, `comboboxes`, `pages/crud`, `routes` e `i18n`.

Además, por cada módulo genera índices de rutas e i18n para frontend.
