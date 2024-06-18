<script setup lang="ts">

import {ref} from "vue";
import {useUser} from "../../composables/useUser";
import {useAuth} from "../../composables/useAuth";
import {useI18n} from "vue-i18n";

const {hasPermission} = useAuth()
const {paginateUser} = useUser()
const {t} = useI18n()

const itemsPerPage = ref(5)
const page = ref(1)
const headers = ref([
  //{title: 'ID', align: 'start', sortable: false, key: 'id'},
  { title: t('user.name'), key: 'name', align: 'start' },
  { title: t('user.username'), key: 'username', align: 'start' },
  { title: t('user.role'), key: 'role.name', align: 'start' },
  { title: t('user.active'), key: 'active', align: 'start' },
  { title: '', key: 'actions', align: 'start' },
])

const serverItems = ref([])
const totalItems = ref(0)
const loading = ref(false)
const search = ref('')

async function loadItems(){
  try{
    loading.value = true
    const r = await paginateUser(page.value,itemsPerPage.value)
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
    <template v-slot:item.active="{ value }" >
      <v-chip :color="value ? 'green':'red'" >
        {{ value ? 'Active' : 'Inactive' }}
      </v-chip>
    </template>

    <template v-slot:item.actions="{item}" >
      <v-btn v-if="hasPermission('user:edit')" icon="mdi-pencil"  variant="text" color="primary" @click="$emit('toEdit', item)"></v-btn>
      <v-btn v-if="hasPermission('user:delete')" icon="mdi-delete" class="mr-1" variant="text" color="red" @click="$emit('toDelete', item)"></v-btn>
    </template>

  </v-data-table-server>
</template>

<style scoped>

</style>
