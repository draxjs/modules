<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PropType } from 'vue'
import type { IEntityCrud, IEntityCrudField } from '@drax/crud-share'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const valueModel = defineModel<Record<string, any>>({ type: Object, default: () => ({}) })

const { field, readonly, density, variant } = defineProps({
  entity: { type: Object as PropType<IEntityCrud>, required: true },
  field: { type: Object as PropType<IEntityCrudField>, required: true },
  readonly: { type: Boolean, default: false },
  density: { type: String as PropType<'comfortable' | 'compact' | 'default'>, default: 'default' },
  variant: {
    type: String as PropType<'underlined' | 'outlined' | 'filled' | 'solo' | 'solo-inverted' | 'solo-filled' | 'plain'>,
    default: 'filled'
  },
  clearable: { type: Boolean, default: false },
  hideDetails: { type: Boolean, default: false },
  singleLine: { type: Boolean, default: false },
  errorMessages: { type: Array as PropType<string[]>, default: () => [] }
})

// Mantener un array local de entradas con IDs únicos
const localEntries = ref<Array<{ id: string; key: string; value: string }>>([])
let nextId = 0
let isUpdatingFromModel = false

// Inicializar desde valueModel
const initializeEntries = () => {
  const modelEntries = Object.entries(valueModel.value || {})
  if (modelEntries.length > 0) {
    localEntries.value = modelEntries.map(([k, v]) => ({
      id: `entry-${nextId++}`,
      key: k,
      value: v as string
    }))
  }
}

// Inicializar al montar
initializeEntries()

// Sincronizar cuando cambia valueModel externamente (no desde updateModel)
watch(() => valueModel.value, () => {
  if (!isUpdatingFromModel) {
    initializeEntries()
  }
  isUpdatingFromModel = false
}, { deep: true })

const addEntry = () => {
  localEntries.value.push({
    id: `entry-${nextId++}`,
    key: '',
    value: ''
  })
}

const removeEntry = (idToRemove: string) => {
  localEntries.value = localEntries.value.filter(entry => entry.id !== idToRemove)
  updateModel()
}

const updateKey = (id: string, newKey: string) => {
  const entry = localEntries.value.find(e => e.id === id)
  if (entry) {
    entry.key = newKey
    updateModel()
  }
}

const updateValue = (id: string, newValue: string) => {
  const entry = localEntries.value.find(e => e.id === id)
  if (entry) {
    entry.value = newValue
    updateModel()
  }
}

const updateModel = () => {
  isUpdatingFromModel = true
  const filtered = localEntries.value.filter(entry => entry.key.trim() !== '' && entry.value.trim() !== '')
  valueModel.value = Object.fromEntries(filtered.map(entry => [entry.key, entry.value]))
}

defineEmits(['updateValue'])
</script>

<template>
  <div class="record-field">
    <v-card variant="flat" border class="mt-3">
      <v-card-title class="text-h5">{{ field.label }}</v-card-title>
      <v-card-text>
        <div v-if="localEntries.length === 0" class="text-center py-4">
          <p class="text-grey">{{ t('common.noData') || 'No data' }}</p>
        </div>

        <div v-for="entry in localEntries" :key="entry.id" class="record-entry mb-3">
          <v-row dense>
            <v-col cols="12" sm="5">
              <v-text-field
                  :model-value="entry.key"
                  :label="t('common.key') || 'Key'"
                  :density="density"
                  :variant="variant"
                  :readonly="readonly"
                  @update:model-value="(v) => updateKey(entry.id, v)"
                  @blur="$emit('updateValue')"
                  outlined
              />
            </v-col>
            <v-col cols="12" sm="5">
              <v-text-field
                  :model-value="entry.value"
                  :label="t('common.value') || 'Value'"
                  :density="density"
                  :variant="variant"
                  :readonly="readonly"
                  @update:model-value="(v) => updateValue(entry.id, v)"
                  @blur="$emit('updateValue')"
                  outlined
              />
            </v-col>
            <v-col cols="12" sm="2" class="d-flex align-center">
              <v-btn
                  v-if="!readonly"
                  icon="mdi-delete"
                  size="small"
                  color="error"
                  variant="text"
                  @click="removeEntry(entry.id)"
              />
            </v-col>
          </v-row>
        </div>

        <v-divider v-if="localEntries.length > 0" class="my-3" />

        <v-btn
            v-if="!readonly"
            prepend-icon="mdi-plus"
            color="primary"
            variant="tonal"
            block
            @click="addEntry"
        >
          {{ t('action.addEntry') || 'Add Entry' }}
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.record-field {
  width: 100%;
}

.record-entry {
  border-left: 3px solid rgba(0, 0, 0, 0.12);
  padding-left: 12px;
}
</style>
