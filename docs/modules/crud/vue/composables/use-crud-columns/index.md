# useCrudColumns

## Propósito

`useCrudColumns(entity)` administra las columnas visibles de una tabla CRUD, respetando permisos y persistiendo la selección en `localStorage`.

## Qué resuelve

- Inicializa columnas visibles a partir de `entity.headers` y `entity.selectedHeaders`.
- Filtra headers por permiso con `useAuth()`.
- Traduce títulos con i18n.
- Persiste la selección del usuario por entidad.

## Piezas principales

- `visibleColumns`
- `translatedHeaders`
- `filteredHeaders`
- `availableColumns`
- `toggleColumn(columnKey)`
- `selectAll()`
- `deselectAll()`
- `resetToDefault()`

## Cuándo usarlo

Conviene en componentes tipo tabla o galería que permiten personalizar columnas visibles.

## Ejemplo

```ts
import { useCrudColumns } from '@drax/crud-vue'
import { UserCrud } from '@drax/identity-vue'

const {
  filteredHeaders,
  availableColumns,
  toggleColumn,
  resetToDefault,
} = useCrudColumns(UserCrud.instance)
```
