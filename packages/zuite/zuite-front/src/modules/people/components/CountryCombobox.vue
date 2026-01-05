<script setup lang="ts">
import CountryCrud from '../cruds/CountryCrud'
import {CrudAutocomplete} from "@drax/crud-vue";
import {IEntityCrudField} from "@drax/crud-share";
import {defineProps, type PropType} from "vue";


const valueModel = defineModel<any>({type: String})

const entityName = CountryCrud.instance.name

const {name, label} = defineProps({
  name: {type: String as PropType<string>, required: false},
  label: {type: String as PropType<string>, required: false},
})


const field: IEntityCrudField = {
  default: undefined,
  label: label || entityName,
  name: name || entityName,
  type: 'ref'
}


</script>

<template>

  <crud-autocomplete
    v-model="valueModel"
    :field="field"
    :entity="CountryCrud.instance"
    variant="outlined"
  ></crud-autocomplete>

</template>

<style scoped>

</style>
