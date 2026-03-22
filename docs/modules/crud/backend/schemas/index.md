# Schemas

## Propósito

`schemas` define piezas Zod reutilizables para params, querystrings y respuestas estándar del backend CRUD.

## Piezas principales

- Query:
  - `PaginateQuerySchema`
  - `FindQuerySchema`
  - `SearchQuerySchema`
  - `FindByParamSchema`
  - `GroupByQuerySchema`
- Params:
  - `IdParamSchema`
- Responses:
  - `DeleteBodyResponseSchema`
  - `ExportBodyResponseSchema`
  - `ErrorBodyResponseSchema`
  - `ValidationErrorBodyResponseSchema`
  - `PaginateBodyResponseSchema`

## Cuándo usarlo

Conviene cuando necesitás describir endpoints CRUD de forma consistente y reusable.
