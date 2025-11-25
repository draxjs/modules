
<script setup lang="ts">
import UserSessionCrud from '../../cruds/UserSessionCrud'
import {Crud} from "@drax/crud-vue";
import {formatDateTime} from "@drax/common-front"

</script>

<template>
  <crud :entity="UserSessionCrud.instance">
    <template v-slot:item.user="{value}">{{value?.username}}</template>
    <template v-slot:item.createdAt="{value}">{{formatDateTime(value)}}</template>
  </crud>
</template>

<style scoped>

</style>

