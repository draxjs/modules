# Services

## Propósito

La carpeta ofrece la capa base de negocio para CRUDs.

## Piezas principales

- `AbstractService<T, C, U>`: implementa create, update, updatePartial, delete, findById, findOneBy, findOne, findBy, search, paginate, export y groupBy.
- Soporta:
  - validación de input/output con Zod
  - transformación previa y posterior (`transformCreate`, `transformUpdate`, `transformRead`)
  - hooks de ciclo de vida (`onCreated`, `onUpdated`, `onDeleted`)
  - exportación a CSV o JSON vía `ExportCsv` y `ExportJson`

## Cuándo usarlo

Usalo como base de servicios de entidad cuando necesitás centralizar validación, hooks y operaciones CRUD sin reescribir la lógica repetitiva.
