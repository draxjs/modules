# CrudFormList

## Propósito

`CrudFormList` edita fields `array.object`. Permite crear, seleccionar, editar y eliminar elementos complejos dentro de un formulario principal.

## v-model

- `modelValue` (`any[]`): lista de registros embebidos.

## Props

- `entity` (`IEntityCrud`, requerida)
- `field` (`IEntityCrudField`, requerido)
- `readonly`
- `hideDetails`
- `singleLine`
- `clearable`
- `density`
- `variant`

## Evento

- `updateValue`

## Estados internos

- `itemSelected`: item actualmente enfocado.
- `indexSelected`: índice del item enfocado.
- `menuMaxHeight`: máximo alto configurable desde `field.menuMaxHeight`.

## Modos de UI

El comportamiento depende de `field.arrayObjectUI`:

- `accordion`: cada item se muestra en un panel expandible.
- `chips`: el listado usa chips horizontales y el detalle queda abajo.
- cualquier otro valor: layout maestro/detalle con menú lateral.

## Cómo crea elementos

Cuando se agrega un item nuevo, el componente arma un objeto inicial usando `field.objectFields` y sus valores `default`.

## Manejo de errores

Consulta `useCrudStore(entity.name).hasFieldListInputErrors(field.name + '.' + index)` para marcar elementos con errores.

## Ejemplo

```vue
<CrudFormList
  :entity="invoiceEntity"
  :field="lineItemsField"
  v-model="form.items"
  variant="outlined"
  @updateValue="recalculateInvoice"
/>
```

## Cuándo usarlo

Conviene para subformularios repetibles, por ejemplo ítems de factura, teléfonos, direcciones o atributos embebidos.
