<script setup lang="ts">

import CountryProvider from "@/modules/people/providers/CountryProvider";
import {Ref} from "vue";

const valueModel = defineModel({type: [String, Array], required: true})

defineProps({
  multiple: {type: Boolean, default: false},
  chips: {type: Boolean, default: false},
  clearable: {type: Boolean, default: true}
})

const loading: Ref<boolean> = ref(false)
const items: Ref<Array<any>> = ref([])

const provider = new CountryProvider()

async function onChange(value:string) {
  try{
    console.log('Search:', value)
    loading.value = true
    items.value = await provider.search(value)
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
    label="Autocomplete"
    :items="items"
    :multiple="multiple"
    :chips="chips"
    :clearable="clearable"
    :debounce="500"
    @change="onChange"
  ></v-autocomplete>
</template>

<style scoped>

</style>
