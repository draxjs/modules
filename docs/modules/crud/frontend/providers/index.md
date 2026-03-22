# Providers

## Propósito

La carpeta implementa la capa base de acceso REST para CRUDs del lado cliente.

## Piezas principales

- `AbstractBaseRestProvider`: encapsula `httpClient`, `basePath` y helpers como `prepareFilters()` para serializar `IDraxFieldFilter[]`.
- `AbstractCrudRestProvider<T, C, U>`: implementa `create`, `update`, `updatePartial`, `delete`, `search`, `findById`, `findByIds`, `find`, `findOne`, `paginate`, `groupBy` y `export`.

## Cuándo usarlo

Conviene como clase base para providers concretos de entidades que consumen el backend CRUD estándar.
