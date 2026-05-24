<script setup lang="ts">
import type {PropType} from "vue";
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import type {IEntityCrud} from "@drax/crud-share";
import {useCrudButtonConfig} from "../../config/CrudButtonConfig";

const expanded = defineModel<boolean>({default: false})

defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
})

const {t, te} = useI18n()
const buttonConfig = useCrudButtonConfig("ai")

const tooltip = computed(() => {
  return te('action.aiAssist') ? t('action.aiAssist') : 'Asistencia IA'
})

function toggleExpanded() {
  expanded.value = !expanded.value
}
</script>

<template>
  <v-tooltip :id="`${$attrs.id || 'crud-ai-button'}-tooltip`" class="crud-ai-button__tooltip" location="top">
    <template v-slot:activator="{ props }">
      <v-btn
          v-bind="{ ...$attrs, ...props }"
          :icon="buttonConfig.icon"
          :id="$attrs.id || 'crud-ai-button'"
          class="crud-ai-button mr-1"
          :variant="buttonConfig.variant"
          :rounded="buttonConfig.rounded"
          :color="buttonConfig.color"
          @click="toggleExpanded"
      />
    </template>
    {{ tooltip }}
  </v-tooltip>
</template>

<style scoped>

</style>
