# useDynamicFilters

## Propósito

`useDynamicFilters(entityName, entityFields, filters)` administra filtros configurables dinámicamente por el usuario.

## Qué resuelve

- Genera la lista de campos seleccionables.
- Normaliza tipos para el motor de filtros.
- Ajusta operadores válidos según el tipo del campo.
- Agrega y elimina filtros en runtime.

## Piezas principales

- `dynamicFilter`
- `fieldI18n`
- `selectableFields`
- `operations`
- `getOperations(index)`
- `isValueRequired(index)`
- `addFilter()`
- `removeFilter(index)`
- `onUpdateField(index, resetOperator?)`
- `normalizeFieldType(type)`

## Cuándo usarlo

Conviene en componentes como `CrudFiltersDynamic.vue` donde el usuario arma sus filtros a medida.

## Ejemplo

```ts
const {
  selectableFields,
  addFilter,
  removeFilter,
  onUpdateField,
} = useDynamicFilters(entityName, entityFields, filters)
```
