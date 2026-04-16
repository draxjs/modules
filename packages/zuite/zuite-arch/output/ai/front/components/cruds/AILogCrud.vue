
<script setup lang="ts">
import AILogCrud from '../../cruds/AILogCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="AILogCrud.instance">
    <template v-slot:item.startedAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.endedAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.tenant="{value}">{{value?.name}}</template>
    <template v-slot:item.user="{value}">{{value?.username}}</template>
  </crud>
</template>

<style scoped>

</style>

