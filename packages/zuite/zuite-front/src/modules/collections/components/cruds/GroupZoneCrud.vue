
<script setup lang="ts">
import GroupZoneCrud from '../../cruds/GroupZoneCrud'
import {Crud} from "@drax/crud-vue";

</script>

<template>
  <crud :entity="GroupZoneCrud.instance">
    <template v-slot:item.users="{value}">{{ value.map((v: any) => v.username).join(", ") }}</template>
  </crud>
</template>

<style scoped>

</style>
