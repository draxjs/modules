<script setup lang="ts">

import {PropType, defineModel} from "vue";
import {IEntityForm} from "@/generator/interfaces/IEntityForm";

const model = defineModel({})

const props = defineProps({
  entity:{
    type:Object as PropType<IEntityForm>,
    required:true
  }
})

const headers = computed(()=> {
  return props.entity.fields.map(field => {
    return {
      text: field.name,
      value: field.name
    }
  })
})

const itemsPerPage: Ref<number> = ref(5)
const page: Ref<number> = ref(1)
const serverItems: Ref<any[]> = ref([]);
const totalItems: Ref<number> = ref(0)
const loading: Ref<boolean> = ref(false)
const search: Ref<string> = ref('')

</script>

<template>

  <v-data-table-server
    v-model:page="page"
    v-model:items-per-page="itemsPerPage"
    :headers="headers"
    :items="serverItems"
    :items-length="totalItems"
    :loading="loading"
    :search="search"
    @update:options="loadItems"
  >


    <template v-slot:item.actions="{item}" >
      <v-btn icon="mdi-pencil"  variant="text" color="primary" @click="$emit('toEdit', item)"></v-btn>
      <v-btn icon="mdi-delete" class="mr-1" variant="text" color="red" @click="$emit('toDelete', item)"></v-btn>
    </template>

  </v-data-table-server>

</template>

<style scoped>

</style>
