<script setup lang="ts">
import {computed, ref} from 'vue'
import {useI18n} from "vue-i18n";

const LONG_TEXT_THRESHOLD = 67

const {value} = defineProps({
  title: {type: String, default: ''},
  value: {type: null, required: true},
})

const {t, te} = useI18n()

const fullTextDialog = ref(false)

const isLongString = computed(() => {
  return typeof value === 'string' && value.length > LONG_TEXT_THRESHOLD
})

const displayValue = computed(() => {
  return (Array.isArray(value) && value.length > 0) || !Array.isArray(value) ? value : ''
})

const openFullTextDialog = () => {
  if (!isLongString.value) {
    return
  }

  fullTextDialog.value = true
}
</script>

<template>
  <span
      v-if="isLongString"
      id="crud-row-value-truncated"
      class="crud-row-value crud-row-value--truncated d-inline-block text-truncate crud-row-value__truncated"
      @click="openFullTextDialog"
  >
    {{ displayValue }}
  </span>
  <span v-else id="crud-row-value-text" class="crud-row-value crud-row-value--text">{{ displayValue }}</span>

  <v-dialog id="crud-row-value-dialog" class="crud-row-value-dialog" v-model="fullTextDialog" max-width="720">
    <v-card id="crud-row-value-dialog-card" class="crud-row-value-dialog__card">
      <v-card-title id="crud-row-value-dialog-title" class="crud-row-value-dialog__title text-wrap">
        {{ title }}
      </v-card-title>
      <v-card-text id="crud-row-value-dialog-text" class="crud-row-value-dialog__text crud-row-value__dialog-text">
        {{ displayValue }}
      </v-card-text>
      <v-card-actions id="crud-row-value-dialog-actions" class="crud-row-value-dialog__actions">
        <v-spacer />
        <v-btn id="crud-row-value-dialog-close-button" class="crud-row-value-dialog__close-button" variant="text" @click="fullTextDialog = false">
          {{ te('action.close') ? t('action.close') : 'Close' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.crud-row-value__truncated {
  cursor: pointer;
  max-width: 230px;
}

.crud-row-value__dialog-text {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
