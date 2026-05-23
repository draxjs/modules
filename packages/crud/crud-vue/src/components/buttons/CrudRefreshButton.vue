<script setup lang="ts">
import {useI18n} from "vue-i18n";

const {t} = useI18n()
</script>

<template>
  <v-tooltip :id="`${$attrs.id || 'crud-refresh-button'}-tooltip`" class="crud-refresh-button__tooltip" location="top">
    <template v-slot:activator="{ props }">
      <v-btn
          v-bind="{ ...$attrs, ...props }"
          icon="mdi-refresh"
          :id="$attrs.id || 'crud-refresh-button'"
          class="crud-refresh-button mr-1"
          variant="text"
      >
      </v-btn>
    </template>
    {{ t('action.refresh')}}
  </v-tooltip>
</template>

<style scoped>

</style>
