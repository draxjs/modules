
<script setup lang="ts">
import CountryCrud from '../../cruds/CountryCrud'
import {Crud} from "@drax/crud-vue";

</script>

<template>
  <crud :entity="CountryCrud.instance">
    <template v-slot:item.flag="{value}"><v-img :src="value" max-height="30px" class="my-1" /></template>
    <template v-slot:item.createdBy="{value}">
      {{value ? value.username : ''}}
    </template>
  </crud>
</template>

<style scoped>

</style>

