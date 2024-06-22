<script setup lang="ts">

import {defineProps, ref} from "vue";
import {useRole} from "../../composables/useRole";
import {useAuth} from "../../composables/useAuth";
import {useI18n} from "vue-i18n";

const {hasPermission} = useAuth()
const {paginateRole} = useRole()
const {t} = useI18n()

const props = defineProps({
  filterEnable: {
    type: Boolean,
    default: false,
  }
})

const itemsPerPage = ref(5)
const page = ref(1)
const headers = ref([
  //{title: 'ID', align: 'start', sortable: false, key: 'id'},
  { title: t('role.name'), key: 'name', align: 'start' },
  { title: t('role.childRoles'), key: 'childRoles', align: 'start' },
  { title: t('role.permissions'), key: 'permissions', align: 'start' },
  { title: t('role.readonly'), key: 'readonly', align: 'start' },
  { title: '', key: 'actions', align: 'end', minWidth: '150px' },
])

const serverItems = ref([])
const totalItems = ref(0)
const loading = ref(false)
const search = ref('')

async function loadItems(){
  try{
    loading.value = true
    const r = await paginateRole(page.value,itemsPerPage.value, search.value)
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
    <template v-slot:item.permissions="{ value }" >
          <v-chip v-for="permission in value"
                  :key="permission" color="green"
                  class="ma-1"
          >
            {{$t ? $t(`permission.${permission}`) : permission }}
          </v-chip>
    </template>

    <template v-slot:item.childRoles="{ value }" >
      <v-chip v-for="role in value"
              :key="role" color="blue"
              class="ma-1"
      >
        {{role.name}}
      </v-chip>
    </template>

    <template v-slot:item.readonly="{ value }" >
      <v-chip v-if="value" color="red" >
        <v-icon class="mdi mdi-pencil-off-outline"></v-icon>
      </v-chip>
      <v-chip v-else color="green">
        <v-icon class="mdi mdi-pencil-outline"></v-icon>
      </v-chip>
    </template>

    <template v-slot:item.actions="{item}" >
      <v-btn v-if="hasPermission('role:update')" :disabled="!!item.readonly" icon="mdi-pencil"  variant="text" color="primary" @click="$emit('toEdit', item)"></v-btn>
      <v-btn v-if="hasPermission('role:delete')" :disabled="!!item.readonly" icon="mdi-delete" class="mr-1" variant="text" color="red" @click="$emit('toDelete', item)"></v-btn>
    </template>

  </v-data-table-server>
</template>

<style scoped>

</style>
