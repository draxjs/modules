# useCrudGroupBy

## Propósito

`useCrudGroupBy(entity)` encapsula el flujo de agrupación de resultados CRUD usando `useGroupByStore` y el provider de la entidad.

## Qué resuelve

- Define campos agrupables a partir de `entity.fields`.
- Excluye tipos no aptos para agrupación.
- Permite elegir formato de fecha.
- Ejecuta `entity.provider.groupBy()`.

## Piezas principales

- Estado expuesto:
  - `dialog`
  - `selectedFields`
  - `groupByData`
  - `loading`
  - `dateFormat`
- Computed:
  - `availableFields`
  - `hasDateFields`
  - `dateFormatOptions`
- Métodos:
  - `openDialog`
  - `closeDialog`
  - `resetAndClose`
  - `clearGroupByData`
  - `handleGroupBy`

## Cuándo usarlo

Usalo cuando la UI necesite agrupar datos por uno o más campos, especialmente fechas.

## Ejemplo

```ts
import { useCrudGroupBy } from '@drax/crud-vue'
import { UserCrud } from '@drax/identity-vue'

const {
  openDialog,
  selectedFields,
  dateFormat,
  handleGroupBy,
} = useCrudGroupBy(UserCrud.instance)
```
