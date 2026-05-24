<script setup lang="ts">
import {useCrudButtonConfig} from "../../config/CrudButtonConfig";

defineOptions({inheritAttrs: false})

const buttonConfig = useCrudButtonConfig("dialogPrev")
</script>

<template>
  <v-btn
      v-bind="$attrs"
      :id="$attrs.id || 'crud-dialog-prev-button'"
      class="crud-dialog-prev-button"
      :icon="buttonConfig.icon"
      :variant="buttonConfig.variant"
      :rounded="buttonConfig.rounded"
      :color="buttonConfig.color"
  />
</template>
