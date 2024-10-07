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
import CrudExportList from "./CrudExportList.vue";
import type {IEntityCrud} from "@drax/crud-share";
import {useI18n} from "vue-i18n";
import type {IEntityCrudHeader} from "@drax/crud-share";

const {t} = useI18n()
const {hasPermission} = useAuth()

const {entity} = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
})

const {
  loading, itemsPerPage, page, sortBy, search, totalItems, items,
  loadItems
} = useCrud(entity)

const actions: IEntityCrudHeader[] = [{title: t('action.actions'), key: 'actions', sortable: false, align: 'end', minWidth: '140px'}]
const tHeaders: IEntityCrudHeader[] = entity.headers.map(header => ({...header, title: t(`${entity.name}.fields.${header.title}`)}))

const headers: IEntityCrudHeader[] = [...tHeaders, ...actions]


defineExpose({
  loadItems
});

</script>

<template>
  <v-data-table-server
      class="border"
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
      @update:options="loadItems"
  >
    <template v-slot:top>
      <v-toolbar density="compact">
        <v-toolbar-title>{{ entity.name }}</v-toolbar-title>
        <v-spacer></v-spacer>

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

      <crud-export-list :entity="entity"></crud-export-list>

      <v-card>
        <v-card-text>
          <crud-search v-model="search"></crud-search>
        </v-card-text>
      </v-card>

    </template>


    <template v-for="header in entity.headers" :key="header.key" v-slot:[`item.${header.key}`]="{item, value}">
      <slot :name="`item.${header.key}`" v-bind="{item, value}">
        {{ value }}
      </slot>
    </template>


    <template v-slot:item.actions="{item}">
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
