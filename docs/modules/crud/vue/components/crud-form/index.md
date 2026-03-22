# CrudForm

## Propósito

`CrudForm` resuelve el formulario dinámico de la operación activa. Lee `operation` y `form` desde `useCrud(entity)` y decide qué fields mostrar, cómo validarlos y cómo agruparlos.

## Props

- `entity` (`IEntityCrud`, requerida)

## Eventos

- `created`
- `updated`
- `deleted`
- `viewed`
- `canceled`

## Slots

- `field.<name>`: reemplaza el render de un campo específico.

## Cómo organiza los campos

- `generalFields`: fields sin `groupTab` ni `groupMenu`.
- `tabFields(tab)`: fields agrupados por tabs.
- `menuFields(menu)`: fields agrupados por menú lateral.

El subconjunto inicial depende de la operación actual:

- `create` -> `entity.createFields`
- `edit` -> `entity.updateFields`
- `delete` -> `entity.deleteFields`
- `view` -> `entity.viewFields`

## Validación y errores

- Antes de `create` o `edit` ejecuta `formRef.validate()`.
- Limpia errores con `store.resetErrors()`.
- Muestra errores de backend a través de `CrudFormField`, que consulta `useCrudStore(entity.name)`.
- Marca tabs y menús con texto rojo cuando alguno de sus fields tiene `inputErrors`.

## Acciones

- `submit()`: delega en `onSubmit(form.value)` y reemite el resultado.
- `cancel()`: llama `onCancel()` y reemite `canceled`.

## Ejemplo

```vue
<CrudForm :entity="userEntity" @updated="item => saveAudit(item)">
  <template #field.avatar="{ field }">
    <CrudFormField
      :entity="userEntity"
      :field="field"
      v-model="avatar"
      preview
      preview-height="180px"
    />
  </template>
</CrudForm>
```

## Cuándo usarlo

Usalo cuando querés el formulario CRUD completo, con validación, agrupación, permisos y submit conectado al provider.
