# CrudFormField

## Propósito

`CrudFormField` es el renderer universal de campos. Recibe metadata de `IEntityCrudField` o `IEntityCrudFilter` y decide qué control Vuetify o subcomponente usar.

Es una de las piezas más importantes del módulo porque concentra la traducción entre tipos declarativos y widgets reales.

## v-model

- `modelValue`: acepta `string`, `number`, `boolean`, `object` o `array`.

## Props principales

- `entity` (`IEntityCrud`, requerida)
- `field` (`IEntityCrudField | IEntityCrudFilter`, requerido)
- `readonly`
- `hideDetails`
- `hint`
- `persistentHint`
- `placeholder`
- `persistentPlaceholder`
- `singleLine`
- `multiple`
- `clearable`
- `preview`
- `previewHeight`
- `parentField`
- `errorMessages`
- `onInput`
- `rules`
- `index`
- `density`
- `variant`
- icon props: `prependIcon`, `prependInnerIcon`, `appendIcon`, `appendInnerIcon`

## Evento

- `updateValue`

Se emite cada vez que cambia el valor visible y sirve para que el padre aplique filtros, recalcule estado o sincronice formularios complejos.

## Tipos soportados

- Escalares:
  - `string`
  - `longString`
  - `password`
  - `number`
  - `boolean`
  - `date`
- Selección:
  - `enum`
  - `select`
  - `ref`
- Archivos:
  - `file`
  - `fullFile`
- Objetos:
  - `object`
  - `record`
- Arrays:
  - `array.string`
  - `array.number`
  - `array.enum`
  - `array.ref`
  - `array.object`

## Integraciones relevantes

- Usa `CrudAutocomplete` para referencias.
- Usa `CrudFormList` para arrays de objetos.
- Usa `CrudFormRecord` para mapas clave/valor.
- Usa `MediaField` y `MediaFullField` desde `@drax/media-vue`.
- Toma errores del `useCrudStore(entity.name)` cuando no se le pasan `errorMessages`.

## Particularidades útiles

- Traduce labels con la clave `<entity>.field.<field.label|field.name>`.
- En campos `date`, si `field.endOfDay` está activo, ajusta la hora a `23:59:59`.
- En fields anidados arma nombres como `parent.index.field` para mapear errores del backend.
- Si el field tiene `permission`, no renderiza nada si `useAuth().hasPermission(...)` falla.

## Ejemplo

```vue
<CrudFormField
  :entity="orderEntity"
  :field="field"
  v-model="form[field.name]"
  :rules="orderEntity.getRule(field.name)"
  :on-input="orderEntity.getOnInput(field.name)"
  variant="outlined"
  clearable
  @updateValue="recalculateTotals"
/>
```

## Cuándo usarlo

Usalo cuando necesites renderizar un field CRUD fuera de `CrudForm` o personalizar solo algunos campos manteniendo el contrato declarativo de la entidad.
