
<script setup lang="ts">
import PersonCrud from '../../cruds/PersonCrud'
import {formatDate} from "@drax/common-front"
import {Crud, useCrudStore} from "@drax/crud-vue";
const store = useCrudStore()

</script>
<template>
  <crud :entity="PersonCrud.instance">
    <template v-slot:item.birthdate="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.nationality="{value}">{{value?.name}}</template>
    <template v-slot:item.hobbies="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.languages="{value}">{{ value.map((v:any) => v.name).join(",") }}</template>
    <template v-slot:item.tenant="{value}">{{value?.name}}</template>
    <template v-slot:item.user="{value}">{{value?.username}}</template>
    <template v-slot:filter.fullname="{filterIndex}">
      <v-text-field
        label="FULLNAME"
        color="orange"
        v-model="store.filters[filterIndex].value"
        hint="Filtro custom fullname" persistent-hint
      />
    </template>

  </crud>
</template>

<style scoped>

</style>

