
<script setup lang="ts">
import FileCrud from '../../cruds/FileCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="FileCrud.instance">
    <template v-slot:item.tags="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.lastAccess="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.createdAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.updatedAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.expiresAt="{value}">{{formatDate(value)}}</template>
  </crud>
</template>

<style scoped>

</style>

