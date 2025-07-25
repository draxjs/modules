
<script setup lang="ts">
import CountryCrud from '../../cruds/CountryCrud'
import {Crud, useCrudStore} from "@drax/crud-vue";
const store = useCrudStore()

</script>

<template>
  <crud :entity="CountryCrud.instance">
    <template v-slot:item.flag="{value}"><v-img :src="value" max-height="30px" class="my-1" /></template>
    <template v-slot:item.createdBy="{value}">
      {{value ? value.username : ''}}
    </template>

    <template v-slot:filter.name="{filterIndex}">
      <v-text-field
        density="compact" label="name" color="orange"
        v-model="store.filters[filterIndex].value"
        hint="Filtro custom name" persistent-hint
      />
    </template>
  </crud>
</template>

<style scoped>

</style>

