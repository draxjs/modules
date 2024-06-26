<script setup lang="ts">

import {defineProps, type Ref, ref} from "vue";
import {useTenant} from "../../composables/useTenant";
import {useAuth} from "../../composables/useAuth";
import {useI18n} from "vue-i18n";
import type {ITenant} from "@drax/identity-share";

const {hasPermission} = useAuth()
const {paginateTenant} = useTenant()
const {t} = useI18n()

defineProps({
  filterEnable: {
    type: Boolean,
    default: false,
  }
})

const itemsPerPage = ref(5)
const page = ref(1)
const serverItems: Ref<ITenant[]> = ref([]);
const totalItems = ref(0)
const loading = ref(false)
const search = ref('')
const headers = ref<any>([
  { title: t('tenant.name') as string, key: 'name', align: 'start' },
  { title: '', key: 'actions', align: 'end', minWidth: '150px' },
])

async function loadItems(){
  try{
    loading.value = true
    const r = await paginateTenant({
      page: page.value,
      limit: itemsPerPage.value,
      search: search.value})
    serverItems.value = r.items
    totalItems.value = r.total
  }catch (e){
    console.error(e)
  }finally {
    loading.value = false
  }
}



defineExpose({
  loadItems
});

</script>

<template>
  <v-data-table-server
      v-if="hasPermission('user:manage')"
      v-model:items-per-page="itemsPerPage"
      v-model:page="page"
      :headers="headers"
      :items="serverItems"
      :items-length="totalItems"
      :loading="loading"
      :search="search"
      item-value="name"
      @update:options="loadItems"
  >
    <template v-slot:top>
      <v-toolbar border density="compact" v-if="filterEnable" class="grey-lighten-1">
        <v-toolbar-title>{{ $t('action.filter') }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-text-field v-model="search" hide-details
                      density="compact" class="mr-2"
                      variant="outlined"
                      append-inner-icon="mdi-magnify"
                      :label="$t('action.search')"
                      single-line clearable @click:clear="() => search = ''"
        />

      </v-toolbar>
    </template>


    <template v-slot:item.actions="{item}" >
      <v-btn v-if="hasPermission('tenant:update')"  icon="mdi-pencil"  variant="text" color="primary" @click="$emit('toEdit', item)"></v-btn>
      <v-btn v-if="hasPermission('tenant:delete')"  icon="mdi-delete" class="mr-1" variant="text" color="red" @click="$emit('toDelete', item)"></v-btn>
    </template>

  </v-data-table-server>
</template>

<style scoped>

</style>
