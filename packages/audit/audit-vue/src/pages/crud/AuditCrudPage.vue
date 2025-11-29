
<script setup lang="ts">
import AuditCrud from '../../cruds/AuditCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="AuditCrud.instance">

  </crud>
</template>

<style scoped>

</style>

