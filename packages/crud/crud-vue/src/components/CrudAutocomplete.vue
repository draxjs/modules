<script setup lang="ts">
import {debounce} from "@drax/common-front"
import { type PropType, type Ref} from "vue";
import {ref, onBeforeMount} from "vue";
import type {IEntityCrud, IEntityCrudField} from "@drax/crud-share";
import {VDateInput} from "vuetify/lib/labs/VDateInput";

const valueModel = defineModel<string | string[]>({type: [String, Array], required: false})

const {entity, multiple} = defineProps({
  entity: {type: Object as PropType<IEntityCrud|undefined>, required: true},
  field: {type: Object as PropType<IEntityCrudField>, required: true},
  multiple: {type: Boolean, default: false},
  chips: {type: Boolean, default: false},
  closableChips: {type: Boolean, default: true},
  clearable: {type: Boolean, default: true},
  label: {type: String},
  itemValue: {type: [String], default: '_id'},
  itemTitle: {type: [String], default: 'name'},
  rules: {type: Array as PropType<any>, default: []},
  errorMessages: {type: Array as PropType<string[]>, default: []},
  hideDetails: {type: Boolean, default: false},
  singleLine: {type: Boolean, default: false},
  density: {type: String as PropType<'comfortable' | 'compact' | 'default'>, default: 'default'},
  variant: {type: String as PropType<'underlined' | 'outlined' | 'filled' | 'solo' | 'solo-inverted' | 'solo-filled' | 'plain'>, default: 'filled'},
})

if(!entity){
  throw new Error('entity is required')
}

const loading: Ref<boolean> = ref(false)
const items: Ref<Array<any>> = ref([])

const debouncedSearch = debounce(search, 300)

onBeforeMount(async () => {
  if(valueModel.value && valueModel.value.length > 0){

    if(multiple && Array.isArray(valueModel.value) ){
      items.value = valueModel.value

      // valueModel.value = valueModel.value.map((item:any) => item._id)
      await findByIds(valueModel.value)
    }else if(!Array.isArray(valueModel.value)){
      // items.value = [valueModel.value]
      await findByIds([valueModel.value])
    }



  }
})

async function findByIds(ids: Array<string> = []) {
  try{
    if(!entity){
      throw new Error('Entity is required')
    }
    if(!entity.provider){
      throw new Error('Provider is not defined')
    }
    if (typeof entity.provider.findByIds !== 'function') {
      throw new Error('Provider does not have a findByIds method');
    }
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
    if(!entity){
      throw new Error('Entity is required')
    }
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

defineEmits(['updateValue'])

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
      :item-value="itemValue"
      :item-title="itemTitle"
      :loading="loading"
      :rules="rules"
      :density="density"
      :variant="variant"
      :hide-details="hideDetails"
      :single-line="singleLine"
      :clearable="clearable"
      :error-messages="errorMessages"
      @update:search="debouncedSearch"
      @update:modelValue="$emit('updateValue')"
  ></v-autocomplete>
</template>

<style scoped>

</style>
