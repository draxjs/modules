<script setup lang="ts">
import type {PropType} from 'vue'
import {useAuth} from '@drax/identity-vue'
import EntityCrud from "../EntityCrud";
import CrudSearch from "./CrudSearch.vue";
import {useCrud} from "../composables/UseCrud";
import {useI18n} from "vue-i18n";
const {t, te} = useI18n()
const {hasPermission} = useAuth()

const {entity} = defineProps({
  entity: {type: Object as PropType<EntityCrud>, required: true},
})

const {loading, itemsPerPage, page, sortBy, search, totalItems, items,
loadItems} = useCrud(entity)

const actions = [{title: t('action.actions'),key:'actions', sortable: false, align: 'right'}]
const tHeaders = entity.headers.map(header => ({...header, title: t(`${entity.name}.fields.${header.title}`)}))

const headers = [...tHeaders, ...actions]


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
      <v-toolbar density="compact" >
        <v-toolbar-title>{{ entity.name }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn v-if="entity.isCreatable" icon="mdi-plus" class="mr-1" variant="text" color="primary" @click="$emit('create')">
        </v-btn>
      </v-toolbar>

      <v-card>
        <v-card-text>
          <crud-search v-model="search"></crud-search>
        </v-card-text>
      </v-card>

    </template>


    <template v-for="header in entity.headers" :key="header.key" v-slot:[`item.${header.key}`]="{item, value}">
    <slot :name="`item.${header.key}`" v-bind="{item, value}" >
      {{value}}
    </slot>
    </template>


    <template v-slot:item.actions="{item}">
      <v-btn v-if="entity.isEditable && hasPermission(entity.permissions.update)"
             icon="mdi-pencil" variant="text" color="primary"
             @click="$emit('edit', item)">
      </v-btn>
      <v-btn v-if="entity.isDeletable && hasPermission(entity.permissions.delete)"
             icon="mdi-delete" class="mr-1" variant="text" color="red"
             @click="$emit('delete', item)">
      </v-btn>
    </template>

  </v-data-table-server>
</template>

<style scoped>

</style>
