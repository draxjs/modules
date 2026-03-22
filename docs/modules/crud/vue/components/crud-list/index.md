# CrudList

## Propósito

`CrudList` es la implementación de listado server-side para entidades CRUD. En la práctica hoy su template es equivalente a `CrudListTable`, por lo que funciona como una variante tabular generalista.

## Props

- `entity` (`IEntityCrud`, requerida)

## Eventos

- `import`
- `export`
- `create`
- `view`
- `edit`
- `delete`

## API expuesta

- `doPaginate()`: queda disponible vía `defineExpose` para que el componente padre fuerce una recarga.

## Slots

- `toolbar`
- `filters`
- `filter.<name>`
- `item.<key>`
- `item.actions`

## Estado consumido

Desde `useCrud(entity)` toma:

- `loading`
- `itemsPerPage`
- `page`
- `sortBy`
- `search`
- `totalItems`
- `items`
- `filters`
- `paginationError`

## Qué resuelve

- Renderiza toolbar, búsqueda y filtros.
- Conecta la tabla con paginación server-side.
- Muestra `CrudExportList` cuando hay exportaciones disponibles.
- Aplica permisos antes de mostrar acciones o siquiera la lista.

## Ejemplo

```vue
<CrudList
  ref="listRef"
  :entity="invoiceEntity"
  @create="openCreate"
  @edit="item => openEdit(item)"
/>
```

```ts
const listRef = ref<{ doPaginate: () => void }>()
listRef.value?.doPaginate()
```

## Nota

Si querés una intención más explícita, normalmente conviene usar `CrudListTable` o `CrudListGallery`. `Crud` ya selecciona una de esas variantes automáticamente.
