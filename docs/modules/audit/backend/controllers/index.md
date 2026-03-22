# Controllers

## Propósito

La carpeta concentra la capa HTTP del módulo y reutiliza la infraestructura CRUD de `@drax/crud-back`.

## Piezas principales

- `AuditController`: habilita lecturas, agrupación y exportación, pero bloquea altas, cambios y borrados manuales.

## Cuándo usarlo

Usalo como punto de entrada REST cuando necesites exponer auditoría de forma segura y de solo lectura.
