# CrudListTable

## Propósito

`CrudListTable` renderiza el CRUD en una `v-data-table-server`. Es la variante ideal cuando la entidad se entiende mejor en forma de filas, columnas, ordenamiento y acciones por registro.

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
- `item.<key>`
- `item.actions`

## Cómo trabaja con la entidad

- Usa `entity.headers` como base de columnas.
- Pasa los headers por `useCrudColumns(entity)` para respetar columnas visibles.
- Lee `entity.permissions`, `entity.searchEnable`, `entity.filtersEnable`, `entity.filterButtons`, `entity.isCreatable`, `entity.isGroupable`, `entity.isColumnSelectable` y otras flags.

## Qué maneja internamente

- Paginación server-side vía `doPaginate`.
- Búsqueda por `CrudSearch`.
- Filtros estáticos con `CrudFilters`.
- Filtros dinámicos con `CrudFiltersDynamic`.
- Exportaciones con `CrudExportButton` y `CrudExportList`.
- Group by y selección de columnas con botones dedicados.

## Ejemplo

```vue
<CrudListTable :entity="userEntity" @view="openView">
  <template #item.status="{ value }">
    <v-chip :color="value ? 'green' : 'grey'">
      {{ value ? 'Activo' : 'Inactivo' }}
    </v-chip>
  </template>
</CrudListTable>
```

## Cuándo usarlo

Elegilo cuando el usuario necesita comparar registros, ordenar columnas o trabajar con datasets medianos y grandes.
