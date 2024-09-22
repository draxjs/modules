<script setup lang="ts">
import {debounce} from "@drax/common-front"
import type { PropType, Ref} from "vue";
import {ref, onBeforeMount} from "vue";
import EntityCrud from "../EntityCrud";
import type {ICrudField} from "@/interfaces/IEntityCrud";

const valueModel = defineModel({type: [String, Array], required: false})

const {entity, multiple} = defineProps({
  entity: {type: Object as PropType<EntityCrud>, required: true},
  field: {type: Object as PropType<ICrudField>, required: true},
  multiple: {type: Boolean, default: false},
  chips: {type: Boolean, default: false},
  closableChips: {type: Boolean, default: true},
  clearable: {type: Boolean, default: true},
  label: {type: String},
  itemValue: {type: [String], default: '_id'},
  itemTitle: {type: [String], default: 'name'},
  rules: {type: Array<Function>, default: []},
  errorMessages: {type: Array as PropType<string[]>, default: []},
})

const loading: Ref<boolean> = ref(false)
const items: Ref<Array<any>> = ref([])

const debouncedSearch = debounce(search, 300)

onBeforeMount(async () => {
  if(valueModel.value && valueModel.value.length > 0){
    if(multiple && Array.isArray(valueModel.value) ){
      items.value = valueModel.value
      //await findByIds(valueModel.value)
    }else{
      items.value = [valueModel.value]
      //await findByIds([valueModel.value])
    }

  }
})

async function findByIds(ids: Array<string>) {
  try{
    loading.value = true
    items.value = await entity.provider.findByIds(ids)
  }catch (e){
    console.error(e)
  }finally{
    loading.value = false
  }
}




async function search(value: any) {
  try{
    loading.value = true
    if(!entity.provider.search){
      throw new Error('Provider does not have a search method')
    }
    items.value = await entity.provider.search(value)
  }catch (e){
    console.error(e)
  }finally{
    loading.value = false
  }

}

</script>

<template>
  <v-autocomplete
      v-model="valueModel"
      :label="label ? label : field.label"
      :placeholder="field.label"
      :items="items"
      :multiple="multiple"
      :chips="chips"
      :closable-chips="closableChips"
      :clearable="clearable"
      :item-value="itemValue"
      :item-title="itemTitle"
      :loading="loading"
      :rules="rules"
      :error-messages="errorMessages"
      @update:search="debouncedSearch"
  ></v-autocomplete>
</template>

<style scoped>

</style>
