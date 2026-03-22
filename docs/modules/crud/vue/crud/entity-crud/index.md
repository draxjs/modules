# EntityCrud

## Propósito

`EntityCrud` es la clase base que implementa `IEntityCrud` y concentra la definición declarativa de una entidad CRUD en frontend. Toda la UI genérica del módulo se apoya en esta clase para saber:

- qué columnas mostrar
- qué fields renderizar
- qué provider invocar
- qué refs resolver
- qué reglas aplicar
- qué permisos leer
- cómo comportarse visualmente

Si `Crud`, `CrudForm`, `CrudListTable`, `CrudListGallery`, `CrudFilters`, `CrudAutocomplete` y los stores funcionan de forma genérica, es porque `EntityCrud` les entrega un contrato común.

## Qué exige y qué da por defecto

La clase no es `abstract` en TypeScript, pero está pensada como base de herencia. Algunas piezas tienen implementación real y otras están diseñadas para ser sobreescritas.

### Obligatorio en la práctica

- `name`
- `provider`

Además, el patrón real del proyecto usa un singleton por entidad mediante `static get instance()`.

## Estado base y defaults

### Identidad

- `name`: inicia como cadena vacía.
- `identifier`: retorna `'_id'`.

### Headers

- `headers`: por defecto solo `[{ title: 'ID', key: '_id' }]`
- `selectedHeaders`: por defecto usa todas las keys de `headers`
- `actionHeaders`: agrega una columna `actions` fija al final

### Permisos

- `permissions`: devuelve permisos genéricos:
  - `manage`
  - `view`
  - `create`
  - `update`
  - `delete`

En entidades reales normalmente se sobreescribe con prefijos propios, por ejemplo `person:view` o `country:update`.

### Fields y subsets de operación

- `fields`: por defecto un solo field `_id`
- `createFields`: excluye `_id`, `createdAt`, `updatedAt`
- `updateFields`: excluye `_id`, `createdAt`, `updatedAt`
- `deleteFields`: usa todos los fields
- `viewFields`: usa todos los fields

Esto resuelve un caso común: muchas entidades no quieren editar timestamps ni identificadores, pero sí verlos.

### Filtros

- `filters`: por defecto un filtro `_id eq`
- `formFilters`: transforma cada `IEntityCrudFilter` en `IDraxFieldFilter`

`formFilters` es importante porque prepara la estructura que luego consumen `useCrudStore`, `CrudFilters` y `CrudFiltersDynamic`.

## Construcción automática del form

### `form`

El getter `form` construye el payload inicial a partir de `fields`.

Reglas actuales:

- si el field tiene `default`, usa ese valor
- si el tipo es `object`, llama `objectFields(field)`
- si el tipo es `record`, usa `{}`
- si el tipo contiene `array`, usa `[]`
- en otros casos, usa `null`

### `objectFields(field)`

Intenta construir el valor inicial de un objeto anidado recorriendo `field.objectFields`.

Este método existe para que una entidad declarativa pueda modelar fields complejos como:

- `object`
- `array.object`

sin tener que inicializar manualmente toda la estructura en cada formulario.

## Refs, reglas y callbacks

### `refs` y `getRef(ref)`

- `refs`: por defecto `{}`
- `getRef(ref)`: busca la entidad relacionada y lanza error si no existe

Esto resuelve el problema de fields `ref` y `array.ref`, porque componentes como `CrudFormField`, `CrudAutocomplete` y `CrudRefDisplay` necesitan acceder a otra entidad CRUD para saber provider, label y `refDisplay`.

### `rules` y `getRule(field)`

- `rules`: por defecto `{}`
- `getRule(field)`: devuelve el array de reglas si existe y tiene contenido

Esto permite que `CrudForm` y `CrudFormField` usen validación declarativa por campo.

### `onInputs` y `getOnInput(field)`

- `onInputs`: por defecto `{}`
- `getOnInput(field)`: devuelve la función si existe

Sirve para casos donde un cambio en un input debe gatillar lógica adicional, por ejemplo normalizar texto o sincronizar el store.

## Capacidades funcionales

Todos estos getters devuelven `true` salvo que se indique lo contrario:

- `isViewable`
- `isEditable`
- `isCreatable`
- `isDeletable`
- `isExportable`
- `isImportable`
- `isColumnSelectable`
- `isFilterable`

Además:

- `isItemEditable()` devuelve `true`
- `isItemDeletable()` devuelve `true`
- `isGroupable` devuelve `false`

### Qué problema resuelven

- flags globales como `isCreatable` controlan si la UI muestra o no ciertas acciones
- flags por item como `isItemEditable(item)` permiten decidir por registro
- `isGroupable` habilita o no `CrudGroupByButton`

## Import, export y agrupación

Defaults:

- `exportFormats`: `['CSV', 'JSON']`
- `exportHeaders`: `['_id']`
- `exportFileName`: `'export'`
- `importFormats`: `['CSV', 'JSON']`

Esto da una base mínima para que `CrudExportButton` y el flujo de export tengan información consistente incluso si la entidad todavía no fue afinada.

## Configuración de diálogo y layout

### Dialog

- `dialogFullscreen`: `false`
- `dialogMaxWidth`: `''`
- `dialogZindex`: `1999`

### Agrupación visual del form

- `tabs`: `[]`
- `menus`: `[]`
- `menuMaxHeight`: `'300px'`

Estas opciones resuelven cómo `CrudForm` distribuye los fields:

- sin tabs ni menus: formulario plano
- con `groupTab`: formulario por pestañas
- con `groupMenu`: formulario por menú lateral

## Configuración de listados y filtros

- `searchEnable`: `true`
- `filtersEnable`: `true`
- `dynamicFiltersEnable`: `true`
- `filterButtons`: `true`
- `containerFluid`: `false`

### Estilos y densidad

- `cardDensity`: `default`
- `cardClass`: `'rounded-xl'`
- `toolbarDensity`: `default`
- `toolbarClass`: `'bg-primary'`
- `tableDensity`: `default`
- `headerProps`: `{ class: 'bg-primary' }`
- `tableStriped`: `'even'`
- `footerClass`: `'bg-primary'`
- `applyFilterClass`: `'bg-primary'`
- `cleanFilterClass`: `'text-grey'`
- `submitBtnFormClass`: `'bg-primary'`
- `cancelBtnFormClass`: `'text-grey'`

Estas opciones no cambian la lógica de negocio, pero sí centralizan la apariencia del CRUD en un solo lugar.

## Variantes de inputs por operación

- `inputVariantCreate`: `'outlined'`
- `inputVariantEdit`: `'outlined'`
- `inputVariantView`: `'solo-filled'`
- `inputVariantDelete`: `'solo-filled'`

Esto resuelve una diferencia visual útil:

- en `create` y `edit`, inputs interactivos
- en `view` y `delete`, una apariencia más pasiva

## Métodos relevantes para override

### `provider`

La implementación base lanza `Error('provider not implemented')`. Es el punto más importante a sobreescribir porque toda operación CRUD real depende de este provider.

### `getRef(ref)`

Permite que una entidad con relaciones delegue en otras entidades CRUD.

### `getRule(field)` y `getOnInput(field)`

Evitan que el resto del módulo tenga que acceder directamente al shape interno de `rules` y `onInputs`.

### `isItemEditable(item)` / `isItemDeletable(item)`

Aunque la implementación base siempre retorna `true`, estos métodos existen justamente para restricciones por registro.

## Relación con el resto del módulo

- `Crud` usa `listMode`, `fields`, `filters`, `headers`, estilos y flags
- `CrudForm` consume `createFields`, `updateFields`, `viewFields`, `deleteFields`, `getRule`, `getOnInput`, `tabs`, `menus`
- `CrudFormField` consume `refs`, `getRef`, variants y metadata de field
- `CrudListTable` y `CrudListGallery` usan `headers`, `selectedHeaders`, flags y estilos
- `CrudFilters` y `CrudFiltersDynamic` usan `filters`, `formFilters` y `isFilterable`
- `CrudAutocomplete` y `CrudRefDisplay` dependen de `refs`

## Particularidades visibles en código

- `static get instance()` en la base lanza error; cada entidad concreta debe definir su propio singleton si quiere usar ese patrón.
- La clase no define `listMode`, pero `IEntityCrud` sí lo contempla y componentes como `Crud` lo usan.
- `redirectOnCreate`, `redirectOnUpdate` y `redirectOnDelete` están en la interfaz `IEntityCrud`, pero no tienen implementación en esta clase base.

## Ejemplo mínimo

```ts
class CountryCrud extends EntityCrud {
  static singleton: CountryCrud

  constructor() {
    super()
    this.name = 'Country'
  }

  static get instance(): CountryCrud {
    if (!CountryCrud.singleton) {
      CountryCrud.singleton = new CountryCrud()
    }
    return CountryCrud.singleton
  }

  get provider() {
    return CountryProvider.instance
  }
}
```

## Cuándo usarlo

Usá `EntityCrud` cada vez que una entidad del frontend vaya a participar del ecosistema CRUD de Drax. Es el punto de entrada real del módulo: sin una clase derivada de `EntityCrud`, los componentes genéricos no tienen metadata suficiente para operar.
