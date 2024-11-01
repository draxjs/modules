
<script setup lang="ts">
import CountryCrud from '../cruds/CountryCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="CountryCrud.instance">
    <template v-slot:item.flag="{value}"><v-img :src="value" max-height="30px" class="my-1" /></template>
  </crud>
</template>

<style scoped>

</style>

