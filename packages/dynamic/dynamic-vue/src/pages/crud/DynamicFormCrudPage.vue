
<script setup lang="ts">
import DynamicFormCrud from '../../cruds/DynamicFormCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="DynamicFormCrud.instance">

  </crud>
</template>

<style scoped>

</style>

