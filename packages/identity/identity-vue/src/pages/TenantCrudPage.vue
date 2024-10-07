<script setup lang="ts">
import TenantCrud from '../cruds/tenant-crud/TenantCrud'
import {Crud} from "@drax/crud-vue";
</script>

<template>
  <crud :entity="TenantCrud.instance">

  </crud>
</template>

<style scoped>

</style>
