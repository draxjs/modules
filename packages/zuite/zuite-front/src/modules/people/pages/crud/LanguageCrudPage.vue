
<script setup lang="ts">
import LanguageCrud from '../../cruds/LanguageCrud'
import {Crud} from "@drax/crud-vue";


</script>

<template>
  <crud :entity="LanguageCrud.instance">
  </crud>
</template>

<style scoped>

</style>

