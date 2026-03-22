# CrudAutocomplete

## Propósito

`CrudAutocomplete` resuelve selección de referencias contra otra entidad CRUD. Puede trabajar como `v-autocomplete` remoto o como `v-select` sin filtro local, y opcionalmente permite alta en el momento.

## v-model

- `modelValue` (`string | string[]`)

## Props principales

- `entity` (`IEntityCrud | undefined`, requerida)
- `field` (`IEntityCrudField`, requerido)
- `label`
- `itemTitle` (default `_name` lógico de display, en código default `name`)
- `itemValue` (default `_id`)
- `multiple`
- `chips`
- `closableChips`
- `readonly`
- `clearable`
- `noFilter`
- `hint`
- `persistentHint`
- `rules`
- `onInput`
- `errorMessages`
- `hideDetails`
- `singleLine`
- `addOnTheFly`
- `density`
- `variant`

También acepta los cuatro icon props.

## Evento

- `updateValue`

## Flujo interno

- En `onBeforeMount` hace `search('')` para precargar opciones.
- Si el valor actual referencia IDs aún no cargados, ejecuta `checkIds()` y usa `entity.provider.findById`.
- Si `noFilter` es `true`, usa `v-select`.
- Si `noFilter` es `false`, usa `v-autocomplete` con debounce de `300ms`.
- Si `addOnTheFly` está activo, muestra `CrudCreateOnTheFlyButton`.

## Requisitos sobre el provider

- `search(value)`
- `findById(id)`

Si faltan, el componente lanza errores en tiempo de ejecución.

## Ejemplo

```vue
<CrudAutocomplete
  :entity="roleEntity"
  :field="field"
  v-model="form.roleId"
  item-title="name"
  add-on-the-fly
  @updateValue="touchField"
/>
```

## Cuándo usarlo

Conviene para refs y arrays de refs donde el catálogo es grande o cambia con frecuencia.
