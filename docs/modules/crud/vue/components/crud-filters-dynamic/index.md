# CrudFiltersDynamic

## Propósito

`CrudFiltersDynamic` permite que el usuario agregue filtros en runtime, eligiendo campo, operador y valor.

## v-model

- `modelValue`: estructura usada por el store CRUD para filtros activos.

## Props

- `entity` (`IEntityCrud`, requerida)
- `autoFilter` (`boolean`, default `false`)

## Eventos

- `applyFilter`
- `clearFilter`

## Estado y dependencias

- Lee `store.dynamicFilters` desde `useCrudStore(entity.name)`.
- Busca la definición de la entidad en `useEntityStore()`.
- Delega la lógica de campos/operadores a `useDynamicFilters(...)`.

## Qué expone visualmente

Cada fila dinámica contiene:

- selector de campo
- selector de operador
- input de valor, si el operador lo requiere
- botón para eliminar el filtro

Además agrega un botón final `+ addFilter`.

## Particularidades

- Solo muestra filtros permitidos según `permission`.
- Cuando cambia el campo puede resetear el operador para mantener coherencia.
- Reutiliza `CrudFormField`, así que hereda soporte para refs, enums, fechas, arrays, etc.

## Ejemplo

```vue
<CrudFiltersDynamic
  :entity="auditEntity"
  v-model="filters"
  :auto-filter="false"
  @applyFilter="applyFilters"
/>
```

## Cuándo usarlo

Conviene para vistas avanzadas donde no alcanza con un set fijo de filtros o cuando querés acercarte a una búsqueda tipo builder.
