# Composables

## Propósito

`composables` concentra la lógica reactiva del CRUD de interfaz. En lugar de repartir estado y comportamiento entre muchos componentes, esta carpeta encapsula los flujos principales de tabla, formulario, agrupación, filtros, columnas, i18n y referencias.

## Piezas principales

- `useCrud`: orquestador principal del flujo CRUD.
- `useCrudColumns`: selección, persistencia y filtrado de columnas visibles.
- `useCrudGroupBy`: agrupación de datos por campos y formato de fecha.
- `useDynamicFilters`: manejo de filtros dinámicos editables por el usuario.
- `useFilterIcon`: resolución de iconos por operador de filtro.
- `useFormUtils`: reglas visuales por operación (`create`, `edit`, `delete`, `view`).
- `useInputErrorI18n`: traducción de errores de input desde el store.
- `useCrudRefDisplay`: resolución de textos legibles para referencias.

## Cómo se relacionan

- `useCrud` depende directamente de `useCrudStore`.
- `useCrudColumns` también usa `useCrudStore`, pero se enfoca en columnas y `localStorage`.
- `useCrudGroupBy` combina `useGroupByStore` con `useCrudStore`.
- `useDynamicFilters` es consumido por componentes de filtros dinámicos.
- `useInputErrorI18n` y `useFormUtils` simplifican la integración con formularios.
- `useCrudRefDisplay` y `useFilterIcon` resuelven presentación.

## Navegación recomendada

- [useCrud](/modules/crud/vue/composables/use-crud/)
- [useCrudColumns](/modules/crud/vue/composables/use-crud-columns/)
- [useCrudGroupBy](/modules/crud/vue/composables/use-crud-group-by/)
- [useDynamicFilters](/modules/crud/vue/composables/use-dynamic-filters/)
- [useFilterIcon](/modules/crud/vue/composables/use-filter-icon/)
- [useFormUtils](/modules/crud/vue/composables/use-form-utils/)
- [useInputErrorI18n](/modules/crud/vue/composables/use-input-error-i18n/)
- [useCrudRefDisplay](/modules/crud/vue/composables/use-crud-ref-display/)

## Cuándo usarlo

Usalo desde componentes o páginas cuando necesitás reutilizar la lógica del CRUD sin duplicar estado, side effects ni transformaciones de datos.
