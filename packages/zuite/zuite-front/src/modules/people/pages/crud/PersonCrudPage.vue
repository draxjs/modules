
<script setup lang="ts">
import PersonCrud from '../../cruds/PersonCrud'
import {Crud, useCrudStore} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

const store = useCrudStore()
</script>

<template>
  <crud :entity="PersonCrud.instance">
    <template v-slot:item.birthdate="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.nationality="{value}">{{value?.name}}</template>
    <template v-slot:item.hobbies="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.languages="{value}">{{ value.map(v => v.name).join(",") }}</template>
    <template v-slot:item.tenant="{value}">{{value?.name}}</template>
    <template v-slot:item.user="{value}">{{value?.username}}</template>

    <template v-slot:field.fullname>
      <v-text-field v-model="store.form.fullname" label="FULL NAME" />
    </template>

  </crud>
</template>

<style scoped>

</style>

