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
  - `refvalue`
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

## Editores opcionales para `longString`

Sin configuración adicional, `longString` conserva el textarea habitual. Para habilitar un editor, agregá `editor: 'html'` o `editor: 'markdown'` al field del `EntityCrud`:

```ts
get fields(): IEntityCrudField[] {
  return [
    {name: 'body', type: 'longString', editor: 'html', label: 'Body', default: '', rows: 8},
    {name: 'notes', type: 'longString', editor: 'markdown', label: 'Notes', default: ''},
    {name: 'plainText', type: 'longString', label: 'Plain text', default: ''},
  ]
}
```

Ambos editores mantienen `v-model`, reglas de `v-form`, errores, hints, readonly y las notificaciones `onInput` del CRUD. La opción solo tiene efecto sobre `longString`; el valor persistido sigue siendo un string, sin cambios de esquema backend.

- **HTML:** edición visual con negrita, cursiva, subrayado, tachado, listas, citas, sangrías, alineación, fuentes, tamaño, color, deshacer/rehacer y limpieza de formato. Sanitiza HTML de entrada y pegado con DOMPurify. Usa los comandos de edición nativos del navegador, como el editor de mails de referencia; su disponibilidad depende del navegador (`document.execCommand` es una API obsoleta).
- **Markdown:** edición de texto con botones de formato, encabezados, listas, citas, enlaces, código y tablas. Incluye vista previa local con `marked` y DOMPurify. Guarda Markdown, no el HTML de la vista previa.

También están exportados como componentes independientes:

```vue
<script setup lang="ts">
import {ref} from 'vue'
import {HtmlEditor, MarkdownEditor} from '@drax/crud-vue'

const html = ref('')
const markdown = ref('')
</script>

<template>
  <HtmlEditor v-model="html" label="Contenido HTML" clearable />
  <MarkdownEditor v-model="markdown" label="Notas Markdown" :rows="8" />
</template>
```

La sanitización en el editor no reemplaza la validación o sanitización del backend ni la del destino que renderiza contenido almacenado. No se realizan llamadas a servicios externos para editar o generar la vista previa.

## Opciones de una entidad sin relación: `refvalue`

`refvalue` usa el selector de opciones de una entidad, pero guarda un texto en lugar de su `_id`:

```ts
{ name: 'status', type: 'refvalue', ref: 'Status', label: 'Status', default: '' }
```

- `ref`: clave de la entidad registrada en `entity.refs`, igual que en `ref`.
- `refValue`: propiedad de la opción que se guarda; por defecto `name`.
- `refDisplay`: propiedad que se muestra; por defecto `name`, independiente de `refValue`.

Para mostrar el nombre y guardar un código:

```ts
{
  name: 'status', type: 'refvalue', ref: 'Status',
  refValue: 'code', refDisplay: 'name', label: 'Status', default: ''
}
```

También se puede declarar directamente en el schema de Arch:

```ts
status: {
  type: 'refvalue', ref: 'Status', refValue: 'code', refDisplay: 'name',
  required: true, header: true
}
```

Arch genera el registro de la entidad de opciones en el CRUD y persiste el campo como `string` (Mongo `String`, SQLite `TEXT`, Zod `string`), sin relación ni `populate`. La propiedad elegida debe contener texto; se recomienda que sea única en la entidad de opciones.

La selección no admite valores libres: las opciones se cargan con el provider de la entidad. `noFilter` y `addOnTheFly` funcionan como en `ref`; la creación al vuelo guarda `refValue`, no el ID.

El texto guardado es una copia: renombrar o eliminar la opción no modifica los registros existentes. Los valores históricos se siguen mostrando aunque la opción ya no aparezca en la lista. Este tipo es singular; no se agrega `array.refvalue`.

## Cuándo usarlo

Usalo cuando necesites renderizar un field CRUD fuera de `CrudForm` o personalizar solo algunos campos manteniendo el contrato declarativo de la entidad.
