<script setup lang="ts">
import {useCrudButtonConfig} from "../../config/CrudButtonConfig";

defineOptions({inheritAttrs: false})

const buttonConfig = useCrudButtonConfig("openRouteForm")
</script>

<template>
  <v-btn
      v-bind="$attrs"
      :id="$attrs.id || 'crud-open-route-form-button'"
      class="crud-open-route-form-button"
      :icon="buttonConfig.icon"
      :variant="buttonConfig.variant"
      :rounded="buttonConfig.rounded"
      :color="buttonConfig.color"
  />
</template>
