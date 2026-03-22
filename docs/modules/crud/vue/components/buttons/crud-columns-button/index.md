# CrudColumnsButton

## Propósito

`CrudColumnsButton` abre un menú para seleccionar columnas visibles en listados tabulares.

## Props

- `entity` (`IEntityCrud`, requerida)

## Estado consumido

Desde `useCrudColumns(entity)` usa:

- `availableColumns`
- `toggleColumn`
- `allSelected`
- `someSelected`
- `selectAll`
- `deselectAll`

## Qué permite

- activar o desactivar una columna puntual
- seleccionar todas
- deseleccionar todas

## Ejemplo

```vue
<CrudColumnsButton :entity="userEntity" />
```
