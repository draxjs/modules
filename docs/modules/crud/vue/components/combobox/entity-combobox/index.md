# EntityCombobox

## Propósito

`EntityCombobox` permite elegir una entidad registrada en `useEntityStore()`.

## v-model

- `modelValue`

## Qué hace

- Toma `entityStore.entities` como source de opciones.
- Usa `name` como `item-value`.
- Traduce el label de cada opción buscando `<entity>.entity` en i18n.
- Reenvía atributos extra con `v-bind="$attrs"`.

## Ejemplo

```vue
<EntityCombobox v-model="selectedEntity" clearable />
```

## Cuándo usarlo

Conviene para builders, paneles administrativos o herramientas donde el usuario debe elegir sobre qué entidad operar.
