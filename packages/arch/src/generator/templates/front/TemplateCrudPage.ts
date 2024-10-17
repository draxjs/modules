import {IEntitySchema, ISchema} from "../../../interfaces/IEntitySchema";

const generateRenders = (schema: ISchema) => {
    let content: string = ""
    let fields: Array<string> = []

    for(const field in schema){
        if(['ref'].includes(schema[field].type) && schema[field].ref){
            fields.push(`    <template v-slot:item.${field}="{value}">{{value.${schema[field].refDisplay}}}</template>`)
        }
        if(['array.ref'].includes(schema[field].type) && schema[field].ref){
            fields.push(`    <template v-slot:item.${field}="{value}">{{ value.map(v => v.${schema[field].refDisplay}).join(",") }}</template>`)
        }
        if(['date'].includes(schema[field].type) ){
            fields.push(`    <template v-slot:item.${field}="{value}">{{formatDate(value)}}</template>`)
        }
        if(['array.string'].includes(schema[field].type) ){
            fields.push(`    <template v-slot:item.${field}="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>`)
        }
    }
    content += fields.join("\n")
    return content;
}

export const TemplateCrudPage = (entity: IEntitySchema) => `
<script setup lang="ts">
import ${entity.name}Crud from '../cruds/${entity.name}Crud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="${entity.name}Crud.instance">
${generateRenders(entity.schema)}
  </crud>
</template>

<style scoped>

</style>

`
