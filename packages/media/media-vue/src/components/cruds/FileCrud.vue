
<script setup lang="ts">
import FileEntityCrud from '../../cruds/FileEntityCrud.ts'
import {Crud, useCrudStore} from "@drax/crud-vue";
import {formatDateTime} from "@drax/common-front"
import MediaFieldView from "../MediaFieldView.vue";

function formatFileSize(bytes: number) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];

  let i = 0;
  let size = bytes;

  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }

  return `${size.toFixed(2)} ${units[i]}`;
}

const store = useCrudStore(FileEntityCrud.instance.name)

</script>formatDateTime

<template>
  <crud :entity="FileEntityCrud.instance">
    <template v-slot:item.tags="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.size="{value}">{{formatFileSize(value)}}</template>
    <template v-slot:item.lastAccess="{value}">{{formatDateTime(value)}}</template>
    <template v-slot:item.createdAt="{value}">{{formatDateTime(value)}}</template>
    <template v-slot:item.updatedAt="{value}">{{formatDateTime(value)}}</template>
    <template v-slot:item.expiresAt="{value}">{{formatDateTime(value)}}</template>

    <template v-if="store.operation === 'view' "
    v-slot:form>
      <media-field-view v-model="store.form" />
    </template>


  </crud>
</template>

<style scoped>

</style>

