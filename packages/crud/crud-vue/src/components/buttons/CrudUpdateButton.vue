<script setup lang="ts">
import {useI18n} from "vue-i18n";
const {t} = useI18n()
</script>

<template>
  <v-tooltip :id="`${$attrs.id || 'crud-update-button'}-tooltip`" class="crud-update-button__tooltip" location="top">
    <template v-slot:activator="{ props}">
      <v-btn
          v-bind="{ ...$attrs, ...props }"
          icon="mdi-pencil"
          :id="$attrs.id || 'crud-update-button'"
          class="crud-update-button mr-1"
          variant="text"
          color="blue"
          slim
      >
      </v-btn>
    </template>
      {{ t('action.update')}}
  </v-tooltip>
</template>

<style scoped>

</style>
