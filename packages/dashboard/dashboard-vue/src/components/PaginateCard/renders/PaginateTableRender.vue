<script setup lang="ts">
import type {PropType} from "vue";
import type {IDraxPaginateResult} from "@drax/crud-share";
const {data} = defineProps({
  data: {type: Object as PropType<IDraxPaginateResult<any>>, required: false},
})

</script>

<template>
  <div>
    <h5>PAGINATE - TABLE</h5>
    {{ data }}
  </div>

</template>

<style scoped>

</style>
