<script setup lang="ts">
import {useCrudButtonConfig} from "../../config/CrudButtonConfig";

defineOptions({inheritAttrs: false})

const buttonConfig = useCrudButtonConfig("dialogNext")
</script>

<template>
  <v-btn
      v-bind="$attrs"
      :id="$attrs.id || 'crud-dialog-next-button'"
      class="crud-dialog-next-button"
      :icon="buttonConfig.icon"
      :variant="buttonConfig.variant"
      :rounded="buttonConfig.rounded"
      :color="buttonConfig.color"
  />
</template>
