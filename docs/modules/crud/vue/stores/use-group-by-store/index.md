# useGroupByStore

## Propósito

`useGroupByStore` administra el flujo de agrupación de resultados CRUD. Se usa junto con `useCrudGroupBy()` y la UI de group-by para seleccionar campos, elegir granularidad temporal y almacenar resultados.

## State

- `dialog`: visibilidad del diálogo de group-by.
- `selectedFields`: campos actualmente seleccionados para agrupar.
- `dateFormat`: granularidad temporal (`year`, `month`, `day`, `hour`, `minute`, `second`).
- `loading`: estado de carga del agrupamiento.
- `groupByData`: datos agrupados devueltos por el provider.
- `groupByError`: mensaje de error del flujo.

## Getters

### `hasSelectedFields`

Indica si hay campos seleccionados.

### `selectedFieldsCount`

Cantidad de campos elegidos.

### `isFieldSelected(field)`

Verifica si un campo ya fue agregado.

### `hasGroupByData`

Indica si ya hay resultados.

### `groupByDataCount`

Cantidad de filas agrupadas.

### `getGroupByDataByField(fieldName, fieldValue)`

Busca un resultado puntual dentro de `groupByData`.

## Actions

### Diálogo

- `openDialog`
- `closeDialog`
- `resetAndClose`

### Campos

- `resetFields`
- `setSelectedFields`
- `addField`
- `removeField`

### Datos y estado

- `setLoading`
- `setGroupByData`
- `clearGroupByData`
- `setGroupByError`
- `clearGroupByError`
- `setDateFormat`

## Cuándo usarlo

Usalo cuando la UI permita agrupar resultados por campos simples, referencias o fechas con distintos niveles de detalle.

## Ejemplos

```ts
import { useGroupByStore } from '@drax/crud-vue'

const store = useGroupByStore()

store.openDialog()
store.setDateFormat('month')
store.setSelectedFields([
  { name: 'createdAt', type: 'date', label: 'Created At' }
])
```

```ts
store.setLoading(true)

store.setGroupByData([
  { createdAt: '2026-03', count: 12 },
  { createdAt: '2026-04', count: 8 }
])

store.setLoading(false)
```
