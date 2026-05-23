<script setup lang="ts">
import {useI18n} from "vue-i18n";
const {t} = useI18n()
</script>

<template>
  <v-tooltip :id="`${$attrs.id || 'crud-view-button'}-tooltip`" class="crud-view-button__tooltip" location="top">
    <template v-slot:activator="{ props}">
      <v-btn
          v-bind="{ ...$attrs, ...props }"
          icon="mdi-magnify"
          :id="$attrs.id || 'crud-view-button'"
          class="crud-view-button mr-1"
          variant="text"
          color="teal"
          slim
      >
      </v-btn>
    </template>
      {{ t('action.view')}}
  </v-tooltip>
</template>

<style scoped>

</style>
