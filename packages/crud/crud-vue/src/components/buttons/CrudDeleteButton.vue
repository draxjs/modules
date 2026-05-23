<script setup lang="ts">
import {useI18n} from "vue-i18n";

const {t} = useI18n()
</script>

<template>
  <v-tooltip :id="`${$attrs.id || 'crud-delete-button'}-tooltip`" class="crud-delete-button__tooltip" location="top">
    <template v-slot:activator="{ props}">
      <v-btn
          v-bind="{ ...$attrs, ...props }"
          icon="mdi-delete"
          :id="$attrs.id || 'crud-delete-button'"
          class="crud-delete-button mr-1"
          variant="text"
          color="red"
      >
      </v-btn>
    </template>
    {{ t('action.delete')}}
  </v-tooltip>
</template>

<style scoped>

</style>
