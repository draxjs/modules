<script setup lang="ts">
import {onMounted, ref, computed} from "vue";
import type {PropType} from "vue";
import type {IEntityCrud} from "@drax/crud-share";
import type {IDraxFieldFilter} from "@drax/crud-share/dist";

const {entity, value, refDisplay} = defineProps({
  entity: {type: Object as PropType<IEntityCrud | undefined>, required: true},
  value: {type: Array as PropType<any[]>, required: true},
  refDisplay: {type: String as PropType<String>, required: true},
})

const loading = ref(false)
const items = ref<any[]>([])

onMounted(()=> {
  console.log('onMounted',entity, value, refDisplay)
  fetch()
})

async function fetch() {
  try{
    loading.value = true
    if(entity?.provider?.find){
      const ids = Array.isArray(value) ? value : [value]
      const filters: IDraxFieldFilter[] = [{field: '_id', operator: 'in', value: ids}]
      items.value = await entity.provider.find({filters})
    }
  }catch (e){
    console.error(e)
  }finally{
    loading.value = false
  }
}

const display = computed(() => {
  return items.value.map(item => item[refDisplay as any]).join(', ')
})


</script>

<template>
  {{display}}

</template>

