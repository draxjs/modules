# useEntityStore

## Propósito

`useEntityStore` mantiene el catálogo de entidades CRUD disponibles en la aplicación. Su foco no es el estado de una pantalla, sino el registro global de definiciones `IEntityCrud`.

## State

- `entities`: arreglo de entidades registradas.

## Getters

### `getEntities`

Devuelve el arreglo completo de entidades.

### `hasEntity(name)`

Indica si una entidad ya fue registrada por nombre.

### `getEntity(name)`

Recupera una entidad puntual.

## Actions

### `setEntities(entities)`

Reemplaza la lista completa de entidades registradas.

### `addEntity(entity)`

Agrega una entidad al catálogo.

## Cuándo usarlo

Conviene cuando componentes genéricos como comboboxes, filtros dinámicos o referencias necesitan resolver entidades por nombre en runtime.

## Ejemplos

```ts
import { useEntityStore } from '@drax/crud-vue'
import { UserCrud, RoleCrud } from '@drax/identity-vue'

const entityStore = useEntityStore()

entityStore.setEntities([
  UserCrud.instance,
  RoleCrud.instance,
])
```

```ts
const entityStore = useEntityStore()

if (entityStore.hasEntity('User')) {
  const entity = entityStore.getEntity('User')
  console.log(entity?.fields)
}
```
