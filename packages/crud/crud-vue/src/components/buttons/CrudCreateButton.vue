<script setup lang="ts">
import {useI18n} from "vue-i18n";

const {t} = useI18n()
</script>

<template>
  <v-tooltip :id="`${$attrs.id || 'crud-create-button'}-tooltip`" class="crud-create-button__tooltip" location="top">
    <template v-slot:activator="{ props }">
      <v-btn
          v-bind="{ ...$attrs, ...props }"
             icon="mdi-plus"
             :id="$attrs.id || 'crud-create-button'"
             class="crud-create-button mr-1"
             variant="text"
      >
      </v-btn>
    </template>
    {{ t('action.create')}}
  </v-tooltip>
</template>

<style scoped>

</style>
