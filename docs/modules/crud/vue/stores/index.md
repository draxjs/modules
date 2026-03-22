# Stores

## Propósito

La carpeta centraliza el estado del CRUD con Pinia. Estos stores son la base que consumen `useCrud`, tablas, formularios, filtros y diálogos, evitando pasar estado por props entre muchos componentes.

## `useCrudStore(id)`

## Qué resuelve

`useCrudStore` es el store principal de cada entidad CRUD. Se instancia por nombre de entidad, por ejemplo `useCrudStore('User')`, y mantiene el estado completo de la pantalla: operación actual, formulario, paginación, filtros, errores y exportaciones.

## State

- `operation`: operación actual (`view`, `create`, `edit`, `delete` o `null`).
- `dialog`: controla si el diálogo CRUD está abierto.
- `form`: payload actual del formulario.
- `formValid`: estado de validación del formulario.
- `notify`: visibilidad del feedback tipo toast/snackbar.
- `message`: mensaje de feedback.
- `error`: error general del flujo CRUD.
- `paginationError`: error específico de la carga paginada.
- `filters`: filtros estáticos ya convertidos a `IDraxFieldFilter[]`.
- `dynamicFilters`: filtros dinámicos editables por el usuario.
- `dynamicFiltersEnable`: habilita o deshabilita filtros dinámicos.
- `items`: items cargados para la lista actual.
- `totalItems`: total de resultados para paginación.
- `itemsPerPage`: tamaño de página.
- `page`: página actual.
- `search`: texto de búsqueda libre.
- `sortBy`: criterio de orden actual.
- `loading`: estado de carga general.
- `inputErrors`: errores por campo devueltos por el backend.
- `exportLoading`: estado de carga de exportación.
- `exportFiles`: historial de exportaciones generadas.
- `exportListVisible`: visibilidad del listado de archivos exportados.
- `exportError`: flag de error en exportación.
- `visibleColumns`: columnas visibles en la tabla.

## Getters

### `getFieldValue(fieldName)`

Devuelve el valor actual de un campo dentro de `form`.

### `getFieldInputErrors(fieldName)`

Devuelve la lista de errores de input para un campo concreto.

### `hasFieldListInputErrors(fieldListName)`

Verifica si existen errores asociados a un campo de tipo lista, por ejemplo `addresses.0.street`.

### `getFilterIndex(filterName)`

Busca la posición de un filtro dentro de `filters`.

## Actions

### Estado general

- `setOperation(operation)`
- `setDialog(dialog)`
- `setLoading(loading)`
- `setError(error)`
- `setNotify(notify)`
- `setMessage(message)`
- `showMessage(message)`
- `resetErrors()`

### Formulario

- `setForm(form)`
- `setFormFieldValue(name, value)`
- `setFormValid(formValid)`
- `setInputErrors(inputErrors)`

### Listado y paginación

- `setItems(items)`
- `setTotalItems(totalItems)`
- `setItemsPerPage(itemsPerPage)`
- `setPage(page)`
- `setSearch(search)`
- `setSortBy(sortBy)`
- `setPaginationError(value)`

### Filtros

- `setFilters(filters)`
- `setFilterValue(name, value)`
- `addDynamicFilter(filter)`
- `removeDynamicFilter(index)`
- `setDynamicFilters(filters)`
- `setDynamicFilterValue(name, value)`
- `setDynamicFiltersEnable(enable)`

### Exportación

- `setExportFiles(exportFiles)`
- `addExportFile(exportFile)`
- `setExportLoading(exportLoading)`
- `setExportListVisible(exportListVisible)`
- `setExportError(error)`

### Columnas

- `setVisibleColumns(columns)`
- `clearVisibleColumns()`

## Cuándo usarlo

Usalo cuando la entidad necesite una fuente única de verdad para tabla, búsqueda, dialog, formulario y exportación. Es el store que normalmente usa `useCrud(entity)`.

## Ejemplo

```ts
import { useCrudStore } from '@drax/crud-vue'

const crudStore = useCrudStore('User')

crudStore.setOperation('create')
crudStore.setDialog(true)
crudStore.setForm({
  username: '',
  email: '',
  active: true,
})
```

Ejemplo para paginación y búsqueda:

```ts
const crudStore = useCrudStore('User')

crudStore.setPage(2)
crudStore.setItemsPerPage(20)
crudStore.setSearch('admin')
crudStore.setSortBy([{ key: 'username', order: 'asc' }])
```

Ejemplo para errores de formulario:

```ts
crudStore.setInputErrors({
  email: ['validation.unique'],
  password: ['validation.min_length']
})

const emailErrors = crudStore.getFieldInputErrors('email')
```

## `useEntityStore`

## Qué resuelve

`useEntityStore` registra las entidades CRUD disponibles en la aplicación. Es un catálogo central de definiciones `IEntityCrud`.

## State

- `entities`: arreglo de entidades registradas.

## Getters

### `getEntities`

Devuelve todas las entidades registradas.

### `hasEntity(name)`

Indica si la entidad ya fue registrada.

### `getEntity(name)`

Devuelve la definición `IEntityCrud` de una entidad por nombre.

## Actions

- `setEntities(entities)`: reemplaza el catálogo completo.
- `addEntity(entity)`: agrega una nueva definición.

## Cuándo usarlo

Conviene cuando la app necesita resolver entidades dinámicamente, por ejemplo para filtros dinámicos, comboboxes o páginas genéricas que reciben el nombre de la entidad.

## Ejemplo

```ts
import { useEntityStore } from '@drax/crud-vue'
import { UserCrud } from '@drax/identity-vue'
import { RoleCrud } from '@drax/identity-vue'

const entityStore = useEntityStore()

entityStore.setEntities([
  UserCrud.instance,
  RoleCrud.instance,
])
```

Ejemplo consultando una entidad:

```ts
const entityStore = useEntityStore()

if (entityStore.hasEntity('User')) {
  const entity = entityStore.getEntity('User')
  console.log(entity?.headers)
}
```

## `useGroupByStore`

## Qué resuelve

`useGroupByStore` maneja el estado del flujo de agrupación (`group by`) del CRUD. Se usa junto con `useCrudGroupBy()` y componentes como `CrudGroupByButton`.

## State

- `dialog`: controla si el diálogo de group-by está abierto.
- `selectedFields`: campos elegidos para agrupar.
- `dateFormat`: granularidad temporal para campos fecha (`year`, `month`, `day`, `hour`, `minute`, `second`).
- `loading`: estado de carga del agrupamiento.
- `groupByData`: resultado del agrupamiento.
- `groupByError`: error del proceso de agrupación.

## Getters

### `hasSelectedFields`

Indica si ya hay al menos un campo seleccionado.

### `selectedFieldsCount`

Cantidad de campos seleccionados.

### `isFieldSelected(field)`

Verifica si un campo ya forma parte del agrupamiento actual.

### `hasGroupByData`

Indica si ya existen resultados cargados.

### `groupByDataCount`

Cantidad de resultados agrupados.

### `getGroupByDataByField(fieldName, fieldValue)`

Busca un resultado puntual por nombre y valor de campo.

## Actions

### Diálogo

- `openDialog()`
- `closeDialog()`
- `resetAndClose()`

### Selección de campos

- `resetFields()`
- `setSelectedFields(fields)`
- `addField(field)`
- `removeField(field)`

### Resultado y estado

- `setLoading(value)`
- `setGroupByData(data)`
- `clearGroupByData()`
- `setGroupByError(error)`
- `clearGroupByError()`
- `setDateFormat(dateFormat)`

## Cuándo usarlo

Usalo cuando la UI permita agrupar resultados por uno o varios campos, especialmente si algunos son fechas y necesitás controlar la granularidad.

## Ejemplo

```ts
import { useGroupByStore } from '@drax/crud-vue'

const groupByStore = useGroupByStore()

groupByStore.openDialog()
groupByStore.setDateFormat('month')
groupByStore.setSelectedFields([
  { name: 'createdAt', type: 'date', label: 'Created At' }
])
```

Ejemplo cargando resultados:

```ts
groupByStore.setLoading(true)

groupByStore.setGroupByData([
  { createdAt: '2026-03', count: 12 },
  { createdAt: '2026-04', count: 8 },
])

groupByStore.setLoading(false)
```

## Relación entre stores

- `useCrudStore(id)` guarda el estado operativo de una entidad concreta.
- `useEntityStore` resuelve qué entidades existen y sus metadatos.
- `useGroupByStore` maneja una preocupación transversal de análisis/agrupación.

En la práctica:

- `Crud.vue` y `useCrud()` trabajan principalmente con `useCrudStore`.
- `CrudFiltersDynamic.vue` y `EntityCombobox.vue` consultan `useEntityStore`.
- `CrudGroupByButton.vue` y `useCrudGroupBy()` dependen de `useGroupByStore`.
