<script setup lang="ts">
import TTSVoiceCrud from '../../cruds/TTSVoiceCrud'
import {Crud} from "@drax/crud-vue";

</script>

<template>
  <crud :entity="TTSVoiceCrud.instance">
    <template v-slot:item.tenant="{value}">{{ value?.name }}</template>
    <template v-slot:item.user="{value}">{{ value?.username }}</template>
  </crud>
</template>

<style scoped>

</style>
