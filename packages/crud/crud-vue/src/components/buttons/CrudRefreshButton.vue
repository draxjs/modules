<script setup lang="ts">
import {useI18n} from "vue-i18n";
import {useCrudButtonConfig} from "../../config/CrudButtonConfig";

const {t} = useI18n()
const buttonConfig = useCrudButtonConfig("refresh")
</script>

<template>
  <v-tooltip :id="`${$attrs.id || 'crud-refresh-button'}-tooltip`" class="crud-refresh-button__tooltip" location="top">
    <template v-slot:activator="{ props }">
      <v-btn
          v-bind="{ ...$attrs, ...props }"
          :icon="buttonConfig.icon"
          :id="$attrs.id || 'crud-refresh-button'"
          class="crud-refresh-button mr-1"
          :variant="buttonConfig.variant"
          :rounded="buttonConfig.rounded"
          :color="buttonConfig.color"
      >
      </v-btn>
    </template>
    {{ t('action.refresh')}}
  </v-tooltip>
</template>

<style scoped>

</style>
