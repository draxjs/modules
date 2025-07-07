<script setup lang="ts">
import {useI18n} from "vue-i18n";
import {debounce} from "@drax/common-front"
import {ref, defineModel, watch} from "vue"


const {t} = useI18n()
const model = defineModel<any>()

let input = ref(model.value)

watch(() => model.value, (newValue) => {
  input.value = newValue
})

const debouncedSearch = debounce(updateModel, 500)

function updateModel() {
  model.value = input.value
}

function clear() {
  input.value = ''
  updateModel()
}

</script>

<template>
  <v-text-field v-model="input"
                density="compact"
                class="mr-2"
                variant="outlined"
                append-inner-icon="mdi-magnify"
                :label="t('action.search')"
                single-line hide-details
                @update:modelValue="debouncedSearch"
                clearable
                @click:clear="clear"
  />
</template>

<style scoped>

</style>
