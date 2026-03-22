# CrudActiveFilters

## Propósito

`CrudActiveFilters` muestra los filtros actualmente aplicados como chips removibles.

## Props

- `entity` (`IEntityCrud`, requerida)

## Eventos

- `filterRemoved`
- `filtersCleared`

La implementación actual emite `filterRemoved` al cerrar un chip. `filtersCleared` está declarado pero hoy no se dispara desde el template.

## Qué hace

- Lee `store.filters` desde `useCrudStore(entity.name)`.
- Cruza cada valor con `entity.filters[index]`.
- Oculta filtros sin valor o arrays vacíos.
- Formatea el valor según `filter.type`.

## Formateos especiales

- `date`: usa `formatDate` de `@drax/common-front`
- `boolean`: traduce a `common.yes` / `common.no`
- `ref` y `array.ref`: delega la visualización a `CrudRefDisplay`
- arrays enum/ref: concatena con comas

## Ejemplo

```vue
<CrudActiveFilters
  :entity="reportEntity"
  @filterRemoved="applyFilters"
/>
```

## Cuándo usarlo

Es útil en listados con filtros complejos, especialmente cuando el usuario necesita entender rápido qué condiciones siguen activas.
