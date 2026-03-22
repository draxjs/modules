# Components

## Propósito

`components` contiene la capa visual reutilizable del CRUD Vue. Acá viven los contenedores de alto nivel, las variantes de listado, el formulario dinámico, los filtros, los selectores de referencias y los botones que activan operaciones sobre la entidad.

La idea del módulo no es que cada pantalla reimplemente una tabla o un formulario. En cambio, una `IEntityCrud` describe metadata, permisos, providers, fields, headers y comportamiento; estos componentes leen esa metadata y la convierten en interfaz.

## Cómo está organizada la carpeta

- Contenedores principales:
  - `Crud`
  - `CrudDialog`
  - `CrudList`
  - `CrudListTable`
  - `CrudListGallery`
- Formularios:
  - `CrudForm`
  - `CrudFormField`
  - `CrudFormList`
  - `CrudFormRecord`
- Filtros y búsqueda:
  - `CrudFilters`
  - `CrudFiltersDynamic`
  - `CrudFiltersAction`
  - `CrudActiveFilters`
  - `CrudSearch`
- Referencias y utilidades visuales:
  - `CrudAutocomplete`
  - `CrudRefDisplay`
  - `CrudExportList`
  - `CrudNotify`
- Subcarpetas:
  - `buttons/`: acciones pequeñas desacopladas del layout principal.
  - `combobox/`: selectores específicos, hoy con `EntityCombobox`.

## Flujo habitual

1. `Crud` decide si renderizar `CrudListTable` o `CrudListGallery`.
2. `CrudList*` consume `useCrud` para paginar, buscar, filtrar y exponer acciones.
3. `CrudDialog` envuelve a `CrudForm` cuando la operación requiere modal.
4. `CrudForm` selecciona los campos visibles según `operation` y delega cada control a `CrudFormField`.
5. `CrudFormField` resuelve el widget concreto según `field.type`.
6. Los botones reutilizables disparan creación, edición, borrado, filtros, group by, import y export.

## Navegación recomendada

- Principales:
  - [Crud](/modules/crud/vue/components/crud/)
  - [CrudList](/modules/crud/vue/components/crud-list/)
  - [CrudListTable](/modules/crud/vue/components/crud-list-table/)
  - [CrudListGallery](/modules/crud/vue/components/crud-list-gallery/)
  - [CrudDialog](/modules/crud/vue/components/crud-dialog/)
  - [CrudForm](/modules/crud/vue/components/crud-form/)
  - [CrudFormField](/modules/crud/vue/components/crud-form-field/)
  - [CrudFormList](/modules/crud/vue/components/crud-form-list/)
  - [CrudFormRecord](/modules/crud/vue/components/crud-form-record/)
- Filtros:
  - [CrudFilters](/modules/crud/vue/components/crud-filters/)
  - [CrudFiltersDynamic](/modules/crud/vue/components/crud-filters-dynamic/)
  - [CrudFiltersAction](/modules/crud/vue/components/crud-filters-action/)
  - [CrudActiveFilters](/modules/crud/vue/components/crud-active-filters/)
  - [CrudSearch](/modules/crud/vue/components/crud-search/)
- Utilidades:
  - [CrudAutocomplete](/modules/crud/vue/components/crud-autocomplete/)
  - [CrudRefDisplay](/modules/crud/vue/components/crud-ref-display/)
  - [CrudExportList](/modules/crud/vue/components/crud-export-list/)
  - [CrudNotify](/modules/crud/vue/components/crud-notify/)
- Subgrupos:
  - [Buttons](/modules/crud/vue/components/buttons/)
  - [Combobox](/modules/crud/vue/components/combobox/)

## Ejemplo

```vue
<script setup lang="ts">
import { Crud } from '@drax/crud-vue'
import { userEntity } from '@/entities/userEntity'
</script>

<template>
  <Crud
    :entity="userEntity"
    @created="item => console.log('created', item)"
    @updated="item => console.log('updated', item)"
    @deleted="() => console.log('deleted')"
  >
    <template #item.email="{ value }">
      <strong>{{ value }}</strong>
    </template>
  </Crud>
</template>
```

## Cuándo usarlo

Usá esta carpeta cuando quieras construir interfaces CRUD declarativas sobre `EntityCrud`, mantener comportamiento consistente entre módulos y reutilizar piezas visuales sin copiar lógica de paginación, formularios o filtros.
