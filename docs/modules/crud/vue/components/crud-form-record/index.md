# CrudFormRecord

## Propósito

`CrudFormRecord` edita fields de tipo `record`, es decir, mapas simples `clave -> valor`.

## v-model

- `modelValue` (`Record<string, any>`)

## Props

- `entity` (`IEntityCrud`, requerida)
- `field` (`IEntityCrudField`, requerido)
- `readonly`
- `density`
- `variant`
- `clearable`
- `hideDetails`
- `singleLine`
- `errorMessages`

## Evento

- `updateValue`

## Cómo funciona

- Mantiene una colección local `localEntries` con IDs únicos para evitar problemas al editar claves repetidas.
- Convierte `modelValue` en un array de entradas editables.
- Reconstruye el objeto final con `Object.fromEntries(...)`.
- Filtra entradas incompletas antes de persistirlas al modelo.

## Acciones

- `addEntry()`
- `removeEntry(id)`
- `updateKey(id, newKey)`
- `updateValue(id, newValue)`

## Ejemplo

```vue
<CrudFormRecord
  :entity="settingsEntity"
  :field="metadataField"
  v-model="form.metadata"
  @updateValue="markDirty"
/>
```

## Cuándo usarlo

Es útil para metadata libre, headers, tags parametrizados o configuraciones donde no existe un esquema fijo de subcampos.
