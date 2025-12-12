
<script setup lang="ts">
import DashboardCrud from '../../cruds/DashboardCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="DashboardCrud.instance">

  </crud>
</template>

<style scoped>

</style>

