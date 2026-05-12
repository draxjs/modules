
<script setup lang="ts">
import AgentSessionCrud from '../../cruds/AgentSessionCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="AgentSessionCrud.instance">
    <template v-slot:item.lastMessageAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.tenant="{value}">{{value?.name}}</template>
    <template v-slot:item.user="{value}">{{value?.username}}</template>
  </crud>
</template>

<style scoped>

</style>

