
<script setup lang="ts">
import LanguageCrud from '../../cruds/LanguageCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="LanguageCrud.instance">
    <template v-slot:item.icon="{value}"><v-img :src="value?.url" max-height="30px" class="my-1" /></template>
  </crud>
</template>

<style scoped>

</style>

