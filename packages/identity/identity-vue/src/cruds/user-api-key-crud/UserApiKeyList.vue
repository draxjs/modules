<script setup lang="ts">

import {defineProps, type Ref, ref} from "vue";
import {useUserApiKey} from "../../composables/useUserApiKey";
import {useAuth} from "../../composables/useAuth";
import {useI18n} from "vue-i18n";
import type {IUserApiKey} from "@drax/identity-share";
import {formatDateTime} from "@drax/common-front";

const {hasPermission} = useAuth()
const {paginateUserApiKey} = useUserApiKey()
const {t} = useI18n()

defineProps({
  filterEnable: {
    type: Boolean,
    default: false,
  }
})

const itemsPerPage = ref(5)
const page = ref(1)
const serverItems: Ref<IUserApiKey[]> = ref([]);
const totalItems = ref(0)
const loading = ref(false)
const search = ref('')
const sortBy : Ref<any> = ref([])

const headers = ref<any>([
    ...( hasPermission('userApiKey:view') ? [{ title: t('userApiKey.user') as string, key: 'user.username', align: 'start', sortable: false }] : []),
  { title: t('userApiKey.name') as string, key: 'name', align: 'start' },
  { title: t('userApiKey.ipv4') as string, key: 'ipv4', align: 'start' },
  { title: t('userApiKey.ipv6') as string, key: 'ipv6', align: 'start' },
  { title: t('userApiKey.createdAt') as string, key: 'createdAt', align: 'start' },
  { title: '', key: 'actions', align: 'end', minWidth: '150px' },
])

async function loadItems(){
  try{
    loading.value = true
    const r = await paginateUserApiKey({
      page: page.value,
      limit: itemsPerPage.value,
      orderBy: sortBy.value[0]?.key,
      order: sortBy.value[0]?.order,
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
      class="border"
      v-if="hasPermission('userApiKey:manage')"
      v-model:items-per-page="itemsPerPage"
      :items-per-page-options="[5, 10, 20, 50]"
      v-model:page="page"
      v-model:sort-by="sortBy"
      :headers="headers"
      :items="serverItems"
      :items-length="totalItems"
      :loading="loading"
      :search="search"
      item-value="name"
      @update:options="loadItems"
  >
    <template v-slot:top>
      <v-toolbar  density="compact" v-if="filterEnable">
        <v-toolbar-title>{{ $t('action.filters') }}</v-toolbar-title>
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

    <template v-slot:item.ipv4="{ value }" >
      <v-chip v-for="(ip,index) in value" :key="index">{{ip}}</v-chip>
    </template>

    <template v-slot:item.ipv6="{ value }" >
      <v-chip v-for="(ip,index) in value" :key="index">{{ip}}</v-chip>
    </template>

    <template v-slot:item.createdAt="{ value }" >
      {{formatDateTime(value)}}
    </template>


    <template v-slot:item.actions="{item}" >
      <v-btn v-if="hasPermission('userApiKey:update')"  icon="mdi-pencil"  variant="text" color="primary" @click="$emit('toEdit', item)"></v-btn>
      <v-btn v-if="hasPermission('userApiKey:delete')"  icon="mdi-delete" class="mr-1" variant="text" color="red" @click="$emit('toDelete', item)"></v-btn>
    </template>

  </v-data-table-server>
</template>

<style scoped>

</style>
