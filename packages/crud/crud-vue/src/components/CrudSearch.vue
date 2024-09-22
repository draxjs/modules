<script setup lang="ts">
const model = defineModel<any>()
</script>

<template>
  <v-text-field v-model="model" hide-details
                density="compact" class="mr-2"
                variant="outlined"
                append-inner-icon="mdi-magnify"
                :label="$t('action.search')"
                single-line clearable @click:clear="() => model = ''"
  />
</template>

<style scoped>

</style>
