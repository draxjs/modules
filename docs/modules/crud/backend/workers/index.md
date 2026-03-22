# Workers

## Propósito

`workers` contiene workers de apoyo para operaciones costosas de exportación.

## Piezas principales

- `ExportCsvWorker.ts`
- `ExportCsvWorker.js`

Ambos archivos disparan la exportación CSV fuera del flujo principal.

## Cuándo usarlo

Conviene cuando querés desacoplar exportaciones pesadas del hilo principal del servidor.
