<script setup lang="ts">

import {onMounted, ref} from "vue";
import {useUser} from "../../composables/useUser";

const {paginateUser} = useUser()

const itemsPerPage = ref(5)
const headers = ref([
  //{title: 'ID', align: 'start', sortable: false, key: 'id'},
  { title: 'Username', key: 'username', align: 'start' },
  { title: 'Role', key: 'role.name', align: 'start' },
  { title: 'Active', key: 'active', align: 'start' },
])

const serverItems = ref([])
const totalItems = ref(0)
const loading = ref(false)
const search = ref('')

async function loadItems(){
  try{
    loading.value = true
    const r = await paginateUser(1,5)
    serverItems.value = r.items
    totalItems.value = r.total
  }catch (e){
    console.error(e)
  }finally {
    loading.value = false
  }


}


</script>

<template>
  <v-data-table-server
      v-model:items-per-page="itemsPerPage"
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

  </v-data-table-server>
</template>

<style scoped>

</style>
