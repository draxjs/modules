<script setup lang="ts">
import {useI18n} from "vue-i18n";
const {t} = useI18n()
const model = defineModel<any>()
</script>

<template>
  <v-text-field v-model="model"
                density="compact"
                class="mr-2"
                variant="outlined"
                append-inner-icon="mdi-magnify"
                :label="t('action.search')"
                single-line hide-details
                clearable @click:clear="() => model = ''"
  />
</template>

<style scoped>

</style>
