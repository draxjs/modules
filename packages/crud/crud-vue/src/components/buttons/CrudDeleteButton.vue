<script setup lang="ts">
import {useI18n} from "vue-i18n";
import {useCrudButtonConfig} from "../../config/CrudButtonConfig";

const {t} = useI18n()
const buttonConfig = useCrudButtonConfig("delete")
</script>

<template>
  <v-tooltip :id="`${$attrs.id || 'crud-delete-button'}-tooltip`" class="crud-delete-button__tooltip" location="top">
    <template v-slot:activator="{ props}">
      <v-btn
          v-bind="{ ...$attrs, ...props }"
          :icon="buttonConfig.icon"
          :id="$attrs.id || 'crud-delete-button'"
          class="crud-delete-button mr-1"
          :variant="buttonConfig.variant"
          :rounded="buttonConfig.rounded"
          :color="buttonConfig.color"
      >
      </v-btn>
    </template>
    {{ t('action.delete')}}
  </v-tooltip>
</template>

<style scoped>

</style>
