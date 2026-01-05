import {IEntitySchema, ISchema} from "../../../interfaces/IEntitySchema";


export const TemplateCrudPage = (entity: IEntitySchema) => `
<script setup lang="ts">
import ${entity.name}Crud from '../../cruds/${entity.name}Crud.vue'

</script>

<template>
  <${entity.name}Crud />
</template>

<style scoped>

</style>

`
