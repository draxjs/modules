
<script setup lang="ts">
import UserLoginFailCrud from '../../cruds/UserLoginFailCrud'
import {Crud} from "@drax/crud-vue";
import {formatDateTime} from "@drax/common-front"

</script>

<template>
  <crud :entity="UserLoginFailCrud.instance">
    <template v-slot:item.user="{value}">{{value?.username}}</template>
    <template v-slot:item.createdAt="{value}">{{formatDateTime(value)}}</template>
  </crud>
</template>

<style scoped>

</style>

