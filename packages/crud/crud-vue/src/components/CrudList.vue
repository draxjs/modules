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

const headers: IEntityCrudHeader[] = [...tHeaders, ...actions]


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
          v-if="entity.isEditable && hasPermission(entity.permissions.update)"
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
