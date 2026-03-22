# Exports

## Propósito

La carpeta implementa exportación de resultados CRUD a archivos.

## Piezas principales

- `AbstractExport`: prepara directorios, nombres de archivo, manejo de headers y lectura de propiedades anidadas.
- `ExportCsv`: escribe cursores o colecciones en CSV.
- `ExportJson`: escribe cursores o colecciones en JSON lineal.

## Cuándo usarlo

Usalo cuando un controlador o servicio necesite entregar datasets exportables sin cargar todo en memoria de una vez.
