
<script setup lang="ts">
import LanguageCrud from '../cruds/LanguageCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="LanguageCrud.instance">

  </crud>
</template>

<style scoped>

</style>

