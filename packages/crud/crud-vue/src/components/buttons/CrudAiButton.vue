<script setup lang="ts">
import type {PropType} from "vue";
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import type {IEntityCrud} from "@drax/crud-share";

const expanded = defineModel<boolean>({default: false})

defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
})

const {t, te} = useI18n()

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
          icon="mdi-robot-outline"
          :id="$attrs.id || 'crud-ai-button'"
          class="crud-ai-button mr-1"
          variant="text"
          @click="toggleExpanded"
      />
    </template>
    {{ tooltip }}
  </v-tooltip>
</template>

<style scoped>

</style>
