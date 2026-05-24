<script setup lang="ts">
import {useI18n} from "vue-i18n";
import {useCrudButtonConfig} from "../../config/CrudButtonConfig";
const {t} = useI18n()
const buttonConfig = useCrudButtonConfig("view")
</script>

<template>
  <v-tooltip :id="`${$attrs.id || 'crud-view-button'}-tooltip`" class="crud-view-button__tooltip" location="top">
    <template v-slot:activator="{ props}">
      <v-btn
          v-bind="{ ...$attrs, ...props }"
          :icon="buttonConfig.icon"
          :id="$attrs.id || 'crud-view-button'"
          class="crud-view-button mr-1"
          :variant="buttonConfig.variant"
          :rounded="buttonConfig.rounded"
          :color="buttonConfig.color"
          slim
      >
      </v-btn>
    </template>
      {{ t('action.view')}}
  </v-tooltip>
</template>

<style scoped>

</style>
