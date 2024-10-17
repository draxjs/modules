
<script setup lang="ts">
import CountryCrud from '../cruds/CountryCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="CountryCrud.instance">

  </crud>
</template>

<style scoped>

</style>

