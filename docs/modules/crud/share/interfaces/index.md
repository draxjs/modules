# Interfaces

## Propósito

La carpeta define el lenguaje común del módulo CRUD.

## Piezas principales

- Contratos operativos:
  - `IDraxCrud`
  - `IDraxCrudRepository`
  - `IDraxCrudService`
  - `IDraxCrudProvider`
  - `IDraxCrudEvent`
- Búsqueda y paginación:
  - `IDraxFieldFilter`
  - `IDraxFindOptions`
  - `IDraxFindOneOptions`
  - `IDraxPaginateOptions`
  - `IDraxPaginateResult`
  - `IDraxGroupByOptions`
- Exportación:
  - `IDraxExportOptions`
  - `IDraxExportResult`
  - `IDraxExportResponse`
  - `IDraxCrudProviderExportResult`
- Metadata de UI:
  - `IEntityCrud`
  - `IEntityCrudField`
  - `IEntityCrudFilter`
  - `IEntityCrudForm`
  - `IEntityCrudHeader`
  - `IEntityCrudPermissions`
  - `IEntityCrudRules`
  - `IEntityCrudRefs`
  - `IEntityCrudOnInput`
  - `IEntityCrudOperation`
  - `IEntityCrudFieldVariant`
  - `IEntityCrudFieldSelectItem`
  - `IDynamicForm`
  - `IDraxPermission`

## Cuándo usarlo

Conviene cuando necesitás modelar una entidad CRUD una sola vez y reutilizar esa definición en backend, providers y UI.
