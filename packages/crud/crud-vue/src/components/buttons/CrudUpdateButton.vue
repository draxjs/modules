<script setup lang="ts">
import {useI18n} from "vue-i18n";
import {useCrudButtonConfig} from "../../config/CrudButtonConfig";
const {t} = useI18n()
const buttonConfig = useCrudButtonConfig("update")
</script>

<template>
  <v-tooltip :id="`${$attrs.id || 'crud-update-button'}-tooltip`" class="crud-update-button__tooltip" location="top">
    <template v-slot:activator="{ props}">
      <v-btn
          v-bind="{ ...$attrs, ...props }"
          :icon="buttonConfig.icon"
          :id="$attrs.id || 'crud-update-button'"
          class="crud-update-button mr-1"
          :variant="buttonConfig.variant"
          :rounded="buttonConfig.rounded"
          :color="buttonConfig.color"
          slim
      >
      </v-btn>
    </template>
      {{ t('action.update')}}
  </v-tooltip>
</template>

<style scoped>

</style>
