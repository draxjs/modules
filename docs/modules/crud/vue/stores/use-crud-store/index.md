# useCrudStore

## Propósito

`useCrudStore(id)` es el store principal de una entidad CRUD. Su responsabilidad es centralizar estado de formulario, tabla, paginación, filtros, errores y exportaciones para una instancia concreta de CRUD.

## Firma

```ts
const store = useCrudStore('User')
```

El parámetro `id` se usa para generar un store Pinia distinto por entidad, por ejemplo `CrudStoreUser`, `CrudStoreRole`, etc.

## State

- `operation`: `view`, `create`, `edit`, `delete` o `null`.
- `dialog`: apertura/cierre del diálogo CRUD.
- `form`: datos actuales del formulario.
- `formValid`: resultado de validación del form.
- `notify`: visibilidad del mensaje de feedback.
- `message`: texto del feedback.
- `error`: error general.
- `paginationError`: error específico de paginación.
- `filters`: filtros estáticos serializados como `IDraxFieldFilter[]`.
- `dynamicFilters`: filtros dinámicos configurables por usuario.
- `dynamicFiltersEnable`: habilitación de filtros dinámicos.
- `items`: items visibles en lista.
- `totalItems`: cantidad total de resultados.
- `itemsPerPage`: tamaño de página.
- `page`: página actual.
- `search`: término de búsqueda.
- `sortBy`: orden activo.
- `loading`: carga general.
- `inputErrors`: errores por campo.
- `exportLoading`: carga de exportación.
- `exportFiles`: archivos exportados generados.
- `exportListVisible`: visibilidad del panel de exportaciones.
- `exportError`: flag de error en exportación.
- `visibleColumns`: columnas visibles seleccionadas por usuario.

## Getters

### `getFieldValue(fieldName)`

Obtiene el valor de un campo dentro de `form`.

### `getFieldInputErrors(fieldName)`

Devuelve los errores asociados a un campo.

### `hasFieldListInputErrors(fieldListName)`

Permite detectar errores en listas anidadas, por ejemplo `phones.0.number`.

### `getFilterIndex(filterName)`

Localiza un filtro en `filters`.

## Actions

### Flujo general

- `setOperation`
- `setDialog`
- `setLoading`
- `setError`
- `setNotify`
- `setMessage`
- `showMessage`
- `resetErrors`

### Formulario

- `setForm`
- `setFormFieldValue`
- `setFormValid`
- `setInputErrors`

### Paginación y listado

- `setItems`
- `setTotalItems`
- `setItemsPerPage`
- `setPage`
- `setSearch`
- `setSortBy`
- `setPaginationError`

### Filtros

- `setFilters`
- `setFilterValue`
- `addDynamicFilter`
- `removeDynamicFilter`
- `setDynamicFilters`
- `setDynamicFilterValue`
- `setDynamicFiltersEnable`

### Exportación

- `setExportFiles`
- `addExportFile`
- `setExportLoading`
- `setExportListVisible`
- `setExportError`

### Columnas

- `setVisibleColumns`
- `clearVisibleColumns`

## Cuándo usarlo

Usalo cuando una pantalla CRUD necesita un estado único y reactivo que sobreviva entre tabla, filtros y formulario.

## Ejemplos

```ts
import { useCrudStore } from '@drax/crud-vue'

const store = useCrudStore('User')

store.setOperation('create')
store.setDialog(true)
store.setForm({
  username: '',
  email: '',
  active: true
})
```

```ts
const store = useCrudStore('User')

store.setPage(1)
store.setItemsPerPage(25)
store.setSearch('john')
store.setSortBy([{ key: 'username', order: 'asc' }])
```

```ts
store.setInputErrors({
  email: ['validation.unique'],
  password: ['validation.min_length']
})
```
