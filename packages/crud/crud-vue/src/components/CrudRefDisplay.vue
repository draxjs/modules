<script setup lang="ts">
import {ref, watch} from "vue";
import type {PropType} from "vue";
import type {IEntityCrud} from "@drax/crud-share";
import {useCrudRefDisplay} from "../composables/useCrudRefDisplay";

const props = defineProps({
  entity: {type: Object as PropType<IEntityCrud | undefined>, required: true},
  value: {type: null, required: true},
  displayField: {type: String, required: false},
  refDisplay: {type: String, required: false},
})

const {refDisplay} = useCrudRefDisplay()
const loading = ref(false)
const display = ref<any>('')

async function fetch() {
  try{
    loading.value = true
    if(props.entity){
      display.value = await refDisplay(
        props.entity,
        props.value,
        props.displayField ?? props.refDisplay
      )
    }
  }catch (e){
    console.error(e)
    display.value = props.value
  }finally{
    loading.value = false
  }
}

watch(
  () => [props.entity, props.value, props.displayField, props.refDisplay],
  fetch,
  {immediate: true}
)
</script>

<template>
  <span v-if="loading">...</span>
  <span v-else>{{display}}</span>
</template>
