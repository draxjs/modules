# CrudFilters

## Propósito

`CrudFilters` renderiza el conjunto de filtros declarados en `entity.filters`.

## v-model

- `modelValue`: array/estructura de filtros del store CRUD.

## Props

- `entity` (`IEntityCrud`, requerida)
- `autoFilter` (`boolean`, default `false`)

## Eventos

- `applyFilter`
- `clearFilter`

## Cómo trabaja

- Filtra los fields visibles según permisos.
- Usa `CrudFormField` para cada filtro.
- Si `autoFilter` está activo, cada `updateValue` dispara `applyFilter`.
- Inserta `prepend-inner-icon` según `useFilterIcon()`.

## Slot

- `filter.<name>` para reemplazar un filtro específico.

## Ejemplo

```vue
<CrudFilters
  :entity="userEntity"
  v-model="filters"
  :auto-filter="true"
  @applyFilter="applyFilters"
/>
```

## Cuándo usarlo

Usalo para filtros declarativos tradicionales, cuando la lista de filtros ya está definida por la entidad.
