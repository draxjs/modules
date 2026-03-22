# Crud

## Propósito

`Crud` es el contenedor de más alto nivel. Orquesta listado, dialog, formulario y notificaciones a partir de una sola `entity`.

Es la pieza adecuada cuando querés montar una pantalla CRUD completa con la menor cantidad posible de wiring manual.

## Props

- `entity` (`IEntityCrud`, requerida): define metadata, provider, fields, headers, permisos, modo de listado y estilos.

## Eventos

- `created`
- `updated`
- `deleted`
- `viewed`
- `canceled`

Los eventos se reemiten desde `CrudForm`, por lo que la página consumidora puede reaccionar sin conocer la implementación interna del dialog o del store.

## Slots

- `toolbar`: inserta acciones extra en la barra del listado.
- `filters`: reemplaza el bloque de filtros por uno custom.
- `filter.<name>`: personaliza un filtro puntual.
- `item.<key>`: customiza una celda puntual del listado.
- `item`: personaliza el item completo cuando se usa galería.
- `item.actions`: agrega o reemplaza acciones por registro.
- `tools`: contenido adicional dentro del dialog.
- `form`: reemplaza el formulario completo.
- `field.<name>`: personaliza un campo puntual del formulario.

## Cómo funciona

- Ejecuta `resetCrudStore()` y `prepareFilters()` antes de montar.
- Elige entre `CrudListTable` y `CrudListGallery` según `entity.listMode` y el breakpoint `xs`.
- Mantiene `CrudDialog` sincronizado con `useCrud(entity)`.
- Inserta `CrudNotify` para feedback simple de operación.

## Ejemplo

```vue
<Crud :entity="productEntity" @updated="refreshDashboard">
  <template #toolbar>
    <v-btn variant="flat" color="secondary">Acción extra</v-btn>
  </template>

  <template #field.price="{ field }">
    <CrudFormField
      :entity="productEntity"
      :field="field"
      v-model="productEntity.form.price"
      prefix="$"
    />
  </template>
</Crud>
```

## Cuándo usarlo

Usalo cuando la pantalla necesita el flujo CRUD completo. Si solo querés una tabla o solo un formulario, conviene trabajar directamente con `CrudList*` o `CrudForm`.
