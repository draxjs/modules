<script setup lang="ts">
import type {PropType} from 'vue'
import {onMounted} from 'vue'
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
import {useCrudColumns} from "../composables/UseCrudColumns";
import CrudFiltersDynamic from "./CrudFiltersDynamic.vue";
import CrudFiltersAction from "./CrudFiltersAction.vue";
import CrudFilterButton from "./buttons/CrudFilterButton.vue";
import CrudSavedQueriesButton from "./buttons/CrudSavedQueriesButton.vue";
import CrudRefreshButton from "./buttons/CrudRefreshButton.vue";

const {t, te} = useI18n()
const {hasPermission} = useAuth()

const {entity} = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
})

const {
  loading, itemsPerPage, page, search, totalItems, items,
  doPaginate, filters, applyFilters, clearFilters, paginationError,
    isDynamicFiltersEnable
} = useCrud(entity)

// Usar el composable de columnas
const {filteredHeaders} = useCrudColumns(entity)


defineExpose({
  doPaginate
});

defineEmits(['import', 'export', 'create', 'update', 'delete', 'view', 'edit'])

onMounted(() => {
  doPaginate()
});

</script>

<template>
  <div v-if="hasPermission(entity.permissions.view)" :id="`crud-list-gallery-${entity.name}`" class="crud-list-gallery d-flex flex-column h-100 pb-4">
    <!-- Toolbar -->
    <v-toolbar id="crud-list-gallery-toolbar" :class="['crud-list-gallery__toolbar', entity.toolbarClass]" :density="entity.toolbarDensity" extended>
      <v-toolbar-title id="crud-list-gallery-title" class="crud-list-gallery__title">
        {{ te(`${entity.name.toLowerCase()}.crud`) ? t(`${entity.name.toLowerCase()}.crud`) : entity.name }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <template v-slot:extension>

        <v-row id="crud-list-gallery-toolbar-actions" justify="end" class="crud-list-gallery__toolbar-actions px-2 border-t-sm" >

          <slot name="toolbar-left">
          </slot>

          <crud-import-button
              id="crud-list-gallery-import-button"
              class="crud-list-gallery__import-button"
              :entity="entity"
              @import="(file:any, format:any) => $emit('import', file, format)"
          />

          <crud-export-button
              id="crud-list-gallery-export-button"
              class="crud-list-gallery__export-button"
              :entity="entity"
              @export="(v:any) => $emit('export',v)"
          />

          <crud-group-by-button
              v-if="entity.isGroupable"
              id="crud-list-gallery-group-by-button"
              class="crud-list-gallery__group-by-button"
              :entity="entity"
          />

          <crud-filter-button
              id="crud-list-gallery-filter-button"
              class="crud-list-gallery__filter-button"
              :entity="entity" />

          <crud-columns-button
              v-if="entity.isColumnSelectable"
              id="crud-list-gallery-columns-button"
              class="crud-list-gallery__columns-button"
              :entity="entity"
          />

          <crud-saved-queries-button
              v-if="entity.isSavedQueriesEnabled"
              id="crud-list-gallery-saved-queries-button"
              class="crud-list-gallery__saved-queries-button"
              :entity="entity"
          />

          <slot name="toolbar">
          </slot>

          <crud-refresh-button
              v-if="entity.isRefreshable !== false"
              id="crud-list-gallery-refresh-button"
              class="crud-list-gallery__refresh-button"
              @click="doPaginate"
          />

          <crud-create-button
              v-if="entity.isCreatable"
              id="crud-list-gallery-create-button"
              class="crud-list-gallery__create-button"
              :entity="entity"
              @click="$emit('create')"
          />

          <slot name="toolbar-right">

          </slot>
        </v-row>

      </template>


    </v-toolbar>

    <crud-export-list
        id="crud-list-gallery-export-list"
        class="crud-list-gallery__export-list"
        :entity="entity"
    >
      <template #export-table="{ exportFiles }">
        <slot name="export-table" :exportFiles="exportFiles" />
      </template>
    </crud-export-list>

    <crud-import-list
        id="crud-list-gallery-import-list"
        class="crud-list-gallery__import-list"
        :entity="entity"
    >
      <template #import-table="{ importFiles }">
        <slot name="import-table" :importFiles="importFiles" />
      </template>
    </crud-import-list>

    <v-card id="crud-list-gallery-controls" class="crud-list-gallery__controls" variant="flat">
      <v-card-text v-if="entity.searchEnable" id="crud-list-gallery-search-section" class="crud-list-gallery__search-section">
        <crud-search
            id="crud-list-gallery-search"
            class="crud-list-gallery__search"
            v-model="search"
        />
      </v-card-text>

      <v-card-text id="crud-list-gallery-filters-section" class="crud-list-gallery__filters-section pt-0">
        <slot name="filters" v-bind="{filters}"></slot>

        <v-card id="crud-list-gallery-default-filters" class="crud-list-gallery__default-filters" variant="flat" v-if="!$slots.filters">

          <crud-filters
              v-if="entity.filtersEnable"
              id="crud-list-gallery-filters"
              class="crud-list-gallery__filters"
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
              id="crud-list-gallery-dynamic-filters"
              class="crud-list-gallery__dynamic-filters"
              :entity="entity"
              v-model="filters"
              :auto-filter="!entity.filterButtons"
              @clearFilter="clearFilters()"
              @applyFilter="applyFilters()"
          >
          </crud-filters-dynamic>

          <crud-filters-action v-if="entity.filterButtons"
                               id="crud-list-gallery-filters-actions"
                               class="crud-list-gallery__filters-actions"
                               :entity="entity"
                               @clearFilter="clearFilters()"
                               @applyFilter="applyFilters()"
          ></crud-filters-action>
        </v-card>

      </v-card-text>

    </v-card>

    <v-divider id="crud-list-gallery-controls-divider" class="crud-list-gallery__controls-divider"></v-divider>

    <!-- CONTENT GALLERY -->
    <v-container id="crud-list-gallery-content" class="crud-list-gallery__content flex-grow-1 position-relative pa-4" fluid>
      <v-overlay id="crud-list-gallery-loading-overlay" class="crud-list-gallery__loading-overlay align-center justify-center bg-transparent" :model-value="loading" contained scrim="transparent"
                 persistent z-index="4">
        <v-progress-circular id="crud-list-gallery-loading" class="crud-list-gallery__loading" indeterminate color="primary"></v-progress-circular>
      </v-overlay>

      <v-alert
          v-if="paginationError"
          id="crud-list-gallery-pagination-error"
          variant="tonal"
          class="crud-list-gallery__pagination-error w-100 mb-4"
          prominent
          type="error"
          :text="te(paginationError) ? t(paginationError) : paginationError"
      />
      <v-alert v-else-if="!loading && items.length === 0" id="crud-list-gallery-no-data" variant="tonal" class="crud-list-gallery__no-data w-100 mb-4" type="info"
               :text="te('crud.noData') ? t('crud.noData') : 'No data'"/>

      <!-- GALLERY GRIDS -->
      <v-row v-if="items.length > 0" id="crud-list-gallery-grid" class="crud-list-gallery__grid">
        <v-col v-for="(item, index) in items" :id="`crud-list-gallery-item-column-${index}`" class="crud-list-gallery__item-column" :key="item.id || item.uuid || item.name || Math.random()" cols="12" sm="6" md="4"
               xl="3">


            <v-card :id="`crud-list-gallery-item-card-${index}`" class="crud-list-gallery__item-card h-100 d-flex flex-column hover-card" elevation="2" border>
              <slot name="item" v-bind="{item}">
              <v-card-text :id="`crud-list-gallery-item-fields-${index}`" class="crud-list-gallery__item-fields field-grid">
                <template v-for="header in filteredHeaders.filter(h => h.key !=='actions')" :key="header.key">

                  <div :id="`crud-list-gallery-item-field-label-${index}-${header.key}`" class="crud-list-gallery__item-field-label field-label font-weight-regular text-grey-darken-2">
                    {{
                      te(`${entity.name.toLowerCase()}.${header.key}`) ? t(`${entity.name.toLowerCase()}.${header.key}`) : (header.title || header.key)
                    }}
                  </div>

                  <div :id="`crud-list-gallery-item-field-value-${index}-${header.key}`" class="crud-list-gallery__item-field-value field-value font-weight-medium">
                    <slot v-if="$slots[`item.${header.key}`]" :name="`item.${header.key}`"
                          v-bind="{item, value: item[header.key]}">
                      {{ item[header.key] }}
                    </slot>
                    <template v-else>
                      {{ item[header.key] }}
                    </template>
                  </div>

                </template>
              </v-card-text>
              </slot>

              <v-divider :id="`crud-list-gallery-item-divider-${index}`" class="crud-list-gallery__item-divider"></v-divider>

              <v-card-actions :id="`crud-list-gallery-item-actions-${index}`" class="crud-list-gallery__item-actions bg-grey-lighten-4 py-2 px-4 d-flex justify-end flex-wrap gap-2">
                <slot name="item.actions" v-bind="{item, index}">
                </slot>

                <crud-view-button
                    v-if="entity.isViewable && hasPermission(entity.permissions.view)"
                    :id="`crud-list-gallery-item-view-button-${index}`"
                    class="crud-list-gallery__item-view-button"
                    @click="$emit('view', item, index)"
                />

                <crud-update-button
                    v-if="entity.isEditable && entity.isItemEditable(item) && hasPermission(entity.permissions?.update)"
                    :id="`crud-list-gallery-item-update-button-${index}`"
                    class="crud-list-gallery__item-update-button"
                    @click="$emit('edit', item, index)"
                />

                <crud-delete-button
                    v-if="entity.isDeletable && hasPermission(entity.permissions?.delete)"
                    :id="`crud-list-gallery-item-delete-button-${index}`"
                    class="crud-list-gallery__item-delete-button"
                    @click="$emit('delete', item, index)"
                />
              </v-card-actions>
            </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- FOOTER WITH ALIGNED PAGINATION -->
    <v-divider id="crud-list-gallery-footer-divider" class="crud-list-gallery__footer-divider"></v-divider>
    <div id="crud-list-gallery-footer" :class="['crud-list-gallery__footer d-flex align-center justify-space-between flex-wrap px-4 py-3 bg-surface', entity.footerClass]">
      <div id="crud-list-gallery-items-per-page" class="crud-list-gallery__items-per-page d-flex align-center mb-2 mb-sm-0">
        <span id="crud-list-gallery-items-per-page-label" class="crud-list-gallery__items-per-page-label text-body-2 mr-2 text-white">{{
            te('crud.itemsPerPage') ? t('crud.itemsPerPage') : 'Items per page:'
          }}</span>
        <v-select
            id="crud-list-gallery-items-per-page-select"
            v-model="itemsPerPage"
            :items="[5, 10, 20, 50]"
            variant="outlined"
            density="compact"
            hide-details
            class="crud-list-gallery__items-per-page-select pagination-select"
            @update:model-value="doPaginate"
        ></v-select>
      </div>

      <v-pagination
          id="crud-list-gallery-pagination"
          class="crud-list-gallery__pagination"
          v-model="page"
          :length="Math.ceil(totalItems / itemsPerPage) || 1"
          :total-visible="5"
          density="comfortable"
          active-color="primary"
          @update:model-value="doPaginate"
      ></v-pagination>
    </div>
  </div>
</template>

<style scoped>
.hover-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12) !important;
}

.gap-2 {
  gap: 8px;
}

.pagination-select {
  width: 90px;
}

.truncate-label {
  white-space: nowrap;
  min-width: fit-content;
}

.field-grid {
  display: grid;
  grid-template-columns: max-content 1fr;
  column-gap: 14px;
  row-gap: 8px;
  align-items: start;
}

.field-label {
  text-align: right;
  white-space: nowrap;
}

.field-value {
  text-align: left;
  word-break: break-word;
}

.field-label::after {
  content: ":";
  margin-left: 6px;
}

</style>
