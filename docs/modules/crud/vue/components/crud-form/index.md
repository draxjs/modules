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

- `generalFields`: fields sin `groupTab`, `groupMenu` ni `groupSection`.
- `tabFields(tab)`: fields agrupados por tabs.
- `menuFields(menu)`: fields agrupados por menú lateral.
- `sectionFields(section)`: fields agrupados en tarjetas consecutivas, visibles al hacer scroll sin seleccionar tabs ni menús.

Para usar secciones, declaralas en `entity.sections` en el orden deseado y asigná `groupSection` a cada campo:

```ts
get sections(): string[] {
  return ['BASIC', 'ADDRESS']
}

get fields(): IEntityCrudField[] {
  return [
    {name: 'fullname', type: 'string', label: 'Nombre', default: '', groupSection: 'BASIC'},
    {name: 'address', type: 'string', label: 'Dirección', default: '', groupSection: 'ADDRESS'},
  ]
}
```

Los títulos usan la traducción `<entity.i18nName>.sections.<section>` cuando existe, o el nombre de la sección como alternativa. Las tarjetas conservan permisos, validaciones, layout responsive y slots de campos.

El subconjunto inicial depende de la operación actual:

- `create` -> `entity.createFields`
- `edit` -> `entity.updateFields`
- `delete` -> `entity.deleteFields`
- `view` -> `entity.viewFields`

## Validación y errores

- Antes de `create` o `edit` ejecuta `formRef.validate()`.
- Limpia errores con `store.resetErrors()`.
- Muestra errores de backend a través de `CrudFormField`, que consulta `useCrudStore(entity.name)`.
- Marca tabs, menús y títulos de secciones con texto rojo cuando alguno de sus fields tiene `inputErrors`.

## Acciones

- `entity.formActionsFixed`: con `true`, mantiene los botones visibles abajo y agrega scroll al cuerpo del formulario (campos, ID y errores). Usa el alto disponible de la pantalla y se adapta al redimensionamiento. Con `false` o sin configurar, conserva el scroll habitual.
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
