<script setup lang="ts">
import type {PropType} from 'vue'
import {useAuth} from '@drax/identity-vue'
import CrudSearch from "./CrudSearch.vue";
import {useCrud} from "../composables/UseCrud";
import CrudExportButton from "./buttons/CrudExportButton.vue";
import CrudImportButton from "./buttons/CrudImportButton.vue";
import CrudCreateButton from "./buttons/CrudCreateButton.vue";
import CrudUpdateButton from "./buttons/CrudUpdateButton.vue";
import CrudDeleteButton from "./buttons/CrudDeleteButton.vue";
import CrudViewButton from "./buttons/CrudViewButton.vue";
import CrudGroupByButton from "./buttons/CrudGroupByButton.vue";
import CrudColumnsButton from "./buttons/CrudColumnsButton.vue";
import CrudExportList from "./CrudExportList.vue";
import CrudImportList from "./CrudImportList.vue";
import type {IEntityCrud} from "@drax/crud-share";
import {useI18n} from "vue-i18n";
import CrudFilters from "./CrudFilters.vue";
import { useCrudColumns } from "../composables/UseCrudColumns";
import CrudFiltersDynamic from "./CrudFiltersDynamic.vue";
import CrudFiltersAction from "./CrudFiltersAction.vue";
import CrudFilterButton from "./buttons/CrudFilterButton.vue";
import CrudSavedQueriesButton from "./buttons/CrudSavedQueriesButton.vue";
import CrudRowValue from "./CrudRowValue.vue";
import CrudRefreshButton from "./buttons/CrudRefreshButton.vue";

const {t, te} = useI18n()
const {hasPermission} = useAuth()

const {entity} = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
})

const {
  loading, itemsPerPage, page, sortBy, search, totalItems, items,
  doPaginate, filters, applyFilters, clearFilters, paginationError,
  isDynamicFiltersEnable
} = useCrud(entity)

// Usar el composable de columnas
const { filteredHeaders } = useCrudColumns(entity)

defineExpose({
  doPaginate
});

defineEmits(['import', 'export', 'create', 'update', 'delete', 'view', 'edit'])

</script>

<template>
  <v-data-table-server
      :id="`crud-list-table-${entity.name}`"
      class="crud-list-table"
      :density="entity.tableDensity"
      :striped="entity.tableStriped"
      :header-props="entity.headerProps"
      v-if="hasPermission(entity.permissions.view)"
      v-model:items-per-page="itemsPerPage"
      :items-per-page-options="[5, 10, 20, 50]"
      v-model:page="page"
      v-model:sort-by="sortBy"
      :headers="filteredHeaders"
      :items="items"
      :items-length="totalItems"
      :loading="loading"
      :search="search"
      :multi-sort="false"
      item-value="name"
      @update:options="doPaginate"
  >

    <template v-slot:no-data>
      <v-alert
          v-if="paginationError"
          id="crud-list-table-pagination-error"
          variant="tonal"
          class="crud-list-table__pagination-error w-100 ma-2"
          style="width: 100%; min-width: 100%"
          prominent
          type="error"
          :text="te(paginationError) ? t(paginationError) : paginationError"
      />
      <v-alert v-else id="crud-list-table-no-data" variant="tonal"  class="crud-list-table__no-data w-100 ma-2 " type="info" :text="te('crud.noData') ? t('crud.noData') : 'No data' " />
    </template>

    <template v-slot:bottom>
      <v-data-table-footer id="crud-list-table-footer" :class="['crud-list-table__footer', entity.footerClass]"
                           :items-per-page-options="[5, 10, 20, 50]"
      ></v-data-table-footer>
    </template>

    <template v-slot:top>
      <v-toolbar id="crud-list-table-toolbar" :class="['crud-list-table__toolbar', entity.toolbarClass]" :density="entity.toolbarDensity">
        <v-toolbar-title id="crud-list-table-title" class="crud-list-table__title">
          {{ te(`${entity.name.toLowerCase()}.crud`) ? t(`${entity.name.toLowerCase()}.crud`) : entity.name }}
        </v-toolbar-title>
        <v-spacer></v-spacer>

        <slot name="toolbar-left">

        </slot>

        <crud-saved-queries-button
            v-if="entity.isSavedQueriesEnabled"
            id="crud-list-table-saved-queries-button"
            class="crud-list-table__saved-queries-button"
            :entity="entity"
        />


        <crud-import-button
            id="crud-list-table-import-button"
            class="crud-list-table__import-button"
            :entity="entity"
            @import="(file:any, format:any) => $emit('import', file, format)"
        />

        <crud-export-button
            id="crud-list-table-export-button"
            class="crud-list-table__export-button"
            :entity="entity"
            @export="(v:any) => $emit('export',v)"
        />

        <crud-group-by-button
            v-if="entity.isGroupable"
            id="crud-list-table-group-by-button"
            class="crud-list-table__group-by-button"
            :entity="entity"
        />

        <crud-filter-button
            id="crud-list-table-filter-button"
            class="crud-list-table__filter-button"
            :entity="entity" />

        <crud-columns-button
            v-if="entity.isColumnSelectable"
            id="crud-list-table-columns-button"
            class="crud-list-table__columns-button"
            :entity="entity"
        />


        <slot name="toolbar">

        </slot>

        <crud-refresh-button
            v-if="entity.isRefreshable !== false"
            id="crud-list-table-refresh-button"
            class="crud-list-table__refresh-button"
            @click="doPaginate"
        />

        <crud-create-button
            v-if="entity.isCreatable"
            id="crud-list-table-create-button"
            class="crud-list-table__create-button"
            :entity="entity"
            @click="$emit('create')"
        />

        <slot name="toolbar-right">

        </slot>

      </v-toolbar>

      <crud-export-list
          id="crud-list-table-export-list"
          class="crud-list-table__export-list"
          :entity="entity"
      >
        <template #export-table="{ exportFiles }">
          <slot name="export-table" :exportFiles="exportFiles" />
        </template>
      </crud-export-list>

      <crud-import-list
          id="crud-list-table-import-list"
          class="crud-list-table__import-list"
          :entity="entity"
      >
        <template #import-table="{ importFiles }">
          <slot name="import-table" :importFiles="importFiles" />
        </template>
      </crud-import-list>

      <v-card id="crud-list-table-controls" class="crud-list-table__controls" variant="flat">
        <v-card-text v-if="entity.searchEnable" id="crud-list-table-search-section" class="crud-list-table__search-section">
          <crud-search
              id="crud-list-table-search"
              class="crud-list-table__search"
              v-model="search"
          />
        </v-card-text>

        <v-card-text id="crud-list-table-filters-section" class="crud-list-table__filters-section pt-0">
          <slot name="filters" v-bind="{filters}"></slot>

          <v-card id="crud-list-table-default-filters" class="crud-list-table__default-filters" variant="flat" v-if="!$slots.filters">

            <crud-filters
                v-if="entity.filtersEnable"
                id="crud-list-table-filters"
                class="crud-list-table__filters"
                :entity="entity"
                v-model="filters"
                :auto-filter="!entity.filterButtons"
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

            <crud-filters-dynamic
                v-if="isDynamicFiltersEnable"
                id="crud-list-table-dynamic-filters"
                class="crud-list-table__dynamic-filters"
                :entity="entity"
                v-model="filters"
                :auto-filter="!entity.filterButtons"
                @clearFilter="clearFilters()"
                @applyFilter="applyFilters()"
            >
            </crud-filters-dynamic>

            <crud-filters-action v-if="entity.filterButtons"
                                 id="crud-list-table-filters-actions"
                                 class="crud-list-table__filters-actions"
                                 :entity="entity"
                                 @clearFilter="clearFilters()"
                                 @applyFilter="applyFilters()"
            ></crud-filters-action>
          </v-card>

        </v-card-text>

      </v-card>

      <v-divider id="crud-list-table-toolbar-divider" class="crud-list-table__toolbar-divider"></v-divider>



    </template>


    <template v-for="header in entity.headers" :key="header.key" v-slot:[`item.${header.key}`]="{item, value}">
      <slot v-if="$slots[`item.${header.key}`]" :name="`item.${header.key}`" v-bind="{item, value}">
        <crud-row-value
            :id="`crud-list-table-row-value-${header.key}`"
            class="crud-list-table__row-value"
            :title="header.title || header.key"
            :value="value"
        />
      </slot>
    </template>


    <template v-slot:item.actions="{item, index}">

      <slot name="item.actions" v-bind="{item, index}">
      </slot>

      <crud-view-button
          v-if="entity.isViewable && hasPermission(entity.permissions.view)"
          :id="`crud-list-table-row-view-button-${index}`"
          class="crud-list-table__row-view-button"
          @click="$emit('view', item, index)"
      />

      <crud-update-button
          v-if="entity.isEditable && entity.isItemEditable(item) && hasPermission(entity.permissions?.update)"
          :id="`crud-list-table-row-update-button-${index}`"
          class="crud-list-table__row-update-button"
          @click="$emit('edit', item, index)"
      />

      <crud-delete-button
          v-if="entity.isDeletable && hasPermission(entity.permissions?.delete)"
          :id="`crud-list-table-row-delete-button-${index}`"
          class="crud-list-table__row-delete-button"
          @click="$emit('delete', item, index)"
      />

    </template>
  </v-data-table-server>
</template>
