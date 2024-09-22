
<script setup lang="ts">
import PersonCrud from '../cruds/PersonCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"
</script>

<template>
  <crud :entity="PersonCrud.instance">
    <template v-slot:item.birthdate="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.nationality="{value}">{{value}}</template>
    <template v-slot:item.hobbies="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
  </crud>
</template>

<style scoped>

</style>

