# useCrud

## Propósito

`useCrud(entity)` es el composable principal del módulo. Orquesta el store de una entidad, su provider y el flujo completo de listado, formulario, operaciones CRUD, exportación y filtros.

## Qué resuelve

- Sincroniza estado con `useCrudStore(entity.name)`.
- Ejecuta `paginate`, `create`, `update`, `delete` y `export`.
- Controla diálogo, mensajes, loading y errores.
- Combina filtros estáticos con filtros dinámicos.
- Hace casting de datos para edición y visualización.

## Piezas principales

- Computed puente hacia el store:
  - `dialog`
  - `operation`
  - `form`
  - `loading`
  - `items`
  - `filters`
  - `search`
  - `sortBy`
  - `itemsPerPage`
  - `exportFiles`
- Computed internos:
  - `isDynamicFiltersEnable`
  - `prepareDynamicFilters`
  - `getAllFilters`
- Métodos principales:
  - `doPaginate()`
  - `doExport()`
  - `onView()`
  - `onCreate()`
  - `onEdit()`
  - `onDelete()`
  - `onSubmit()`
  - `applyFilters()`
  - `clearFilters()`
  - `openDialog()`
  - `closeDialog()`

## Cuándo usarlo

Es la opción correcta cuando querés implementar una pantalla CRUD completa sin manejar manualmente store, paginación y submit.

## Ejemplo

```ts
import { useCrud } from '@drax/crud-vue'
import { UserCrud } from '@drax/identity-vue'

const {
  items,
  loading,
  dialog,
  form,
  doPaginate,
  onCreate,
  onEdit,
  onSubmit,
} = useCrud(UserCrud.instance)

await doPaginate()
onCreate()
```
