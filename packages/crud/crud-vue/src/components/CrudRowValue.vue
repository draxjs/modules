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
      class="d-inline-block text-truncate crud-row-value__truncated"
      @click="openFullTextDialog"
  >
    {{ displayValue }}
  </span>
  <span v-else>{{ displayValue }}</span>

  <v-dialog v-model="fullTextDialog" max-width="720">
    <v-card>
      <v-card-title class="text-wrap">
        {{ title }}
      </v-card-title>
      <v-card-text class="crud-row-value__dialog-text">
        {{ displayValue }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="fullTextDialog = false">
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
