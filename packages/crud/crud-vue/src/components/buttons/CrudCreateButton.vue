<script setup lang="ts">
import {useI18n} from "vue-i18n";
import {useCrudButtonConfig} from "../../config/CrudButtonConfig";

const {t} = useI18n()
const buttonConfig = useCrudButtonConfig("create")
</script>

<template>
  <v-tooltip :id="`${$attrs.id || 'crud-create-button'}-tooltip`" class="crud-create-button__tooltip" location="top">
    <template v-slot:activator="{ props }">
      <v-btn
          v-bind="{ ...$attrs, ...props }"
             :icon="buttonConfig.icon"
             :id="$attrs.id || 'crud-create-button'"
             class="crud-create-button mr-1"
             :variant="buttonConfig.variant"
             :rounded="buttonConfig.rounded"
             :color="buttonConfig.color"
      >
      </v-btn>
    </template>
    {{ t('action.create')}}
  </v-tooltip>
</template>

<style scoped>

</style>
