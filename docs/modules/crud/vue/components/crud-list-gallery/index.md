# CrudListGallery

## Propósito

`CrudListGallery` presenta el CRUD como tarjetas en grilla. Mantiene casi la misma lógica que `CrudListTable`, pero cambia el layout para casos donde cada registro necesita más aire visual.

## Props

- `entity` (`IEntityCrud`, requerida)

## Eventos

- `import`
- `export`
- `create`
- `view`
- `edit`
- `delete`

## Slots

- `toolbar`
- `filters`
- `filter.<name>`
- `item`: reemplaza el cuerpo visual completo de cada tarjeta.
- `item.<key>`: customiza un campo puntual dentro de la tarjeta.
- `item.actions`

## Particularidades

- Llama `doPaginate()` en `onMounted()`.
- Usa `filteredHeaders` para decidir qué campos mostrar dentro de la tarjeta.
- Mantiene toolbar, búsqueda y filtros antes de la grilla.
- Resuelve paginación con `v-pagination` y un selector manual de `itemsPerPage`.

## Ejemplo

```vue
<CrudListGallery :entity="mediaEntity">
  <template #item="{ item }">
    <v-card-text>
      <v-img :src="item.coverUrl" height="180" cover />
      <h3 class="mt-3">{{ item.title }}</h3>
      <p>{{ item.description }}</p>
    </v-card-text>
  </template>
</CrudListGallery>
```

## Cuándo usarlo

Conviene cuando la entidad tiene imagen, preview, badges o atributos menos tabulares, por ejemplo media, catálogos o cards comerciales.
