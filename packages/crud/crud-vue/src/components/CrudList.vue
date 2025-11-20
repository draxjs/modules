<script setup lang="ts">
import type {PropType} from 'vue'
import {ref, computed} from 'vue'
import {useAuth} from '@drax/identity-vue'
import CrudSearch from "./CrudSearch.vue";
import {useCrud} from "../composables/UseCrud";
import CrudExportButton from "./buttons/CrudExportButton.vue";
import CrudImportButton from "./buttons/CrudImportButton.vue";
import CrudCreateButton from "./buttons/CrudCreateButton.vue";
import CrudUpdateButton from "./buttons/CrudUpdateButton.vue";
import CrudDeleteButton from "./buttons/CrudDeleteButton.vue";
import CrudViewButton from "./buttons/CrudViewButton.vue";
import CrudExportList from "./CrudExportList.vue";
import type {IEntityCrud} from "@drax/crud-share";
import {useI18n} from "vue-i18n";
import type {IEntityCrudHeader} from "@drax/crud-share";
import CrudFilters from "./CrudFilters.vue";

const {t, te} = useI18n()
const {hasPermission} = useAuth()

const {entity} = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
})

const {
  loading, itemsPerPage, page, sortBy, search, totalItems, items,
  doPaginate, filters, applyFilters, clearFilters
} = useCrud(entity)

// Estado para las columnas visibles - inicializado con selectedHeaders
const visibleColumns = ref<string[]>([])

// Inicializar columnas visibles con selectedHeaders del entity
const initializeVisibleColumns = () => {
  const availableHeaders = entity.headers
    .filter(header => !header.permission || hasPermission(header.permission))
    .map(header => header.key)

  // Usar selectedHeaders del entity, filtrando solo las que están disponibles
  visibleColumns.value = entity.selectedHeaders?.filter(key => availableHeaders.includes(key)) || availableHeaders
}

// Inicializar al montar el componente
initializeVisibleColumns()

const actions: IEntityCrudHeader[] = entity.actionHeaders.map(header => ({
  ...header,
  title: te(header.title) ? t(header.title) : header.title,
}))

const tHeaders: IEntityCrudHeader[] = entity.headers
    .filter(header => !header.permission || hasPermission(header.permission))
    .map(header => ({
      ...header,
      title: te(`${entity.name.toLowerCase()}.field.${header.title}`) ? t(`${entity.name.toLowerCase()}.field.${header.title}`) : header.title
    }))

// Filtrar headers según columnas visibles
const headers = computed<IEntityCrudHeader[]>(() => {
  const filteredHeaders = tHeaders.filter(header => visibleColumns.value.includes(header.key))
  return [...filteredHeaders, ...actions]
})

// Lista de columnas disponibles para el menú
const availableColumns = computed(() => {
  return tHeaders.map(header => ({
    key: header.key,
    title: header.title,
    visible: visibleColumns.value.includes(header.key)
  }))
})

// Toggle de visibilidad de columna
const toggleColumn = (columnKey: string) => {
  const index = visibleColumns.value.indexOf(columnKey)
  if (index > -1) {
    visibleColumns.value.splice(index, 1)
  } else {
    visibleColumns.value.push(columnKey)
  }
}

defineExpose({
  doPaginate
});

defineEmits(['import', 'export', 'create', 'update', 'delete', 'view', 'edit'])

</script>

<template>
  <v-data-table-server
      :density="entity.tableDensity"
      :striped="entity.tableStriped"
      :header-props="entity.headerProps"
      v-if="hasPermission(entity.permissions.view)"
      v-model:items-per-page="itemsPerPage"
      :items-per-page-options="[5, 10, 20, 50]"
      v-model:page="page"
      v-model:sort-by="sortBy"
      :headers="headers"
      :items="items"
      :items-length="totalItems"
      :loading="loading"
      :search="search"
      :multi-sort="false"
      item-value="name"
      @update:options="doPaginate"
  >

    <template v-slot:bottom>
      <v-data-table-footer :class="entity.footerClass"
                           :items-per-page-options="[5, 10, 20, 50]"
      ></v-data-table-footer>
    </template>

    <template v-slot:top>
      <v-toolbar :class="entity.toolbarClass" :density="entity.toolbarDensity">
        <v-toolbar-title>
          {{ te(`${entity.name.toLowerCase()}.crud`) ? t(`${entity.name.toLowerCase()}.crud`) : entity.name }}
        </v-toolbar-title>
        <v-spacer></v-spacer>

        <slot name="toolbar">

        </slot>

        <crud-import-button
            :entity="entity"
            @import="v => $emit('import', v)"
        />

        <crud-export-button
            :entity="entity"
            @export="v => $emit('export',v)"
        />

        <!-- Selector de columnas -->
        <v-menu offset-y>
          <template v-slot:activator="{ props }">
            <v-btn
                v-bind="props"
                icon
                variant="text"
            >
              <v-icon>mdi-view-column</v-icon>
              <v-tooltip activator="parent" location="bottom">
                {{ t('crud.columns.select') }}
              </v-tooltip>
            </v-btn>
          </template>
          <v-list>
            <v-list-subheader>
              {{ t('crud.columns.title') }}
            </v-list-subheader>
            <v-list-item
                v-for="column in availableColumns"
                :key="column.key"
                @click="toggleColumn(column.key)"
            >
              <template v-slot:prepend>
                <v-checkbox-btn
                    :model-value="column.visible"
                    @click.stop="toggleColumn(column.key)"
                ></v-checkbox-btn>
              </template>
              <v-list-item-title>{{ column.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <crud-create-button
            v-if="entity.isCreatable"
            :entity="entity"
            @click="$emit('create')"
        />

      </v-toolbar>

      <crud-export-list
          :entity="entity"
      />

      <v-card variant="flat">
        <v-card-text v-if="entity.searchEnable">
          <crud-search
              v-model="search"
          />
        </v-card-text>

        <v-card-text class="pt-0">
          <slot name="filters" v-bind="{filters}"></slot>

          <crud-filters
              v-if="!$slots.filters"
              :entity="entity"
              v-model="filters"
              :action-buttons="entity.filterButtons"
              @clearFilter="clearFilters()"
              @applyFilter="applyFilters()"
          >

            <template v-for="iFilter in entity.filters"
                      :key="iFilter.name"
                      v-slot:[`filter.${iFilter.name}`]="{filter, filterIndex}"
            >
              <slot v-if="$slots[`filter.${iFilter.name}`]"
                    :name="`filter.${iFilter.name}`"
                    v-bind="{filter, filterIndex}"
              />
            </template>
          </crud-filters>
        </v-card-text>

      </v-card>

      <v-divider></v-divider>
    </template>


    <template v-for="header in entity.headers" :key="header.key" v-slot:[`item.${header.key}`]="{item, value}">
      <slot v-if="$slots[`item.${header.key}`]" :name="`item.${header.key}`" v-bind="{item, value}">
        {{ value }}
      </slot>
    </template>


    <template v-slot:item.actions="{item}">

      <slot name="item.actions" v-bind="{item}">
      </slot>

      <crud-view-button
          v-if="entity.isViewable && hasPermission(entity.permissions.view)"
          @click="$emit('view', item)"
      />

      <crud-update-button
          v-if="entity.isEditable && entity.isItemEditable(item) && hasPermission(entity.permissions.update)"
          @click="$emit('edit', item)"
      />

      <crud-delete-button
          v-if="entity.isDeletable && hasPermission(entity.permissions.delete)"
          @click="$emit('delete', item)"
      />

    </template>

  </v-data-table-server>
</template>

<style scoped>

</style>
