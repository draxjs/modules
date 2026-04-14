<script setup lang="ts">
import {computed, ref, watch} from "vue";
import type {PropType} from "vue";
import {useI18n} from "vue-i18n";
import type {IEntityCrud, IEntityCrudField} from "@drax/crud-share";
import {HttpRestClientFactory} from "@drax/common-front";
import {useCrud} from "../composables/UseCrud";
import {useAuth} from "@drax/identity-vue";

type CrudAiResponse = {
  message?: string | null
  suggestions?: Record<string, any>
  warnings?: string[]
}

const expanded = defineModel<boolean>({default: false})

const emit = defineEmits<{
  apply: [form: Record<string, any>]
}>()

const {entity} = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
})

const {t, te} = useI18n()
const {hasPermission} = useAuth()
const {form, operation} = useCrud(entity)
const httpClient = HttpRestClientFactory.getInstance()

const prompt = ref("")
const loading = ref(false)
const error = ref("")
const response = ref<CrudAiResponse | null>(null)

function cloneValue<T>(value: T): T {
  if (value === undefined) {
    return value
  }

  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value)
    } catch (_error) {
    }
  }

  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item)) as T
  }

  if (value instanceof Date) {
    return new Date(value.getTime()) as T
  }

  if (value && typeof value === 'object') {
    const objectValue = value as Record<string, any>
    const plainObject = Object.keys(objectValue).reduce((acc, key) => {
      const item = objectValue[key]

      if (typeof item === 'function') {
        return acc
      }

      try {
        acc[key] = cloneValue(item)
      } catch (_error) {
        acc[key] = item
      }

      return acc
    }, {} as Record<string, any>)

    return plainObject as T
  }

  return value
}

function normalizeField(field: IEntityCrudField): Record<string, any> {
  return {
    name: field.name,
    type: field.type,
    label: field.label,
    hint: field.hint,
    placeholder: field.placeholder,
    readonly: field.readonly,
    default: field.default,
    enum: field.enum,
    items: field.items?.map(item => ({
      title: item.title,
      value: item.value,
    })),
    ref: field.ref,
    refDisplay: field.refDisplay,
    objectFields: field.objectFields?.map(normalizeField),
  }
}

function parseStructuredValue(field: IEntityCrudField, value: any) {
  if (value === null || value === undefined) {
    return value
  }

  const jsonEncodedTypes = ['record', 'array.object', 'array.record', 'array.fullFile', 'file', 'fullFile']

  if (field.type === 'object' && field.objectFields && typeof value === 'object') {
    return value
  }

  if (field.type === 'object' && typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch (_error) {
      return value
    }
  }

  if (jsonEncodedTypes.includes(field.type) && typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch (_error) {
      return value
    }
  }

  return value
}

const editableFields = computed(() => {
  const sourceFields = operation.value === 'edit'
      ? entity.updateFields
      : entity.createFields

  return sourceFields.filter((field: IEntityCrudField) => {
    if (field.readonly) {
      return false
    }

    if (field.permission && !hasPermission(field.permission)) {
      return false
    }

    return !['id', 'password', 'file', 'fullFile', 'array.fullFile'].includes(field.type)
  })
})

const allowedFieldNames = computed(() => {
  return new Set(editableFields.value.map(field => field.name))
})

const currentForm = computed(() => {
  return cloneValue(form.value || entity.form || {})
})

const sanitizedSuggestions = computed(() => {
  const suggestions = response.value?.suggestions || {}

  return Object.keys(suggestions).reduce((acc, key) => {
    if (allowedFieldNames.value.has(key)) {
      const field = editableFields.value.find(item => item.name === key)
      acc[key] = field ? parseStructuredValue(field, suggestions[key]) : suggestions[key]
    }
    return acc
  }, {} as Record<string, any>)
})

function isEqualValue(left: any, right: any) {
  return JSON.stringify(left) === JSON.stringify(right)
}

function deepMerge(target: any, source: any): any {
  if (Array.isArray(source)) {
    return cloneValue(source)
  }

  if (source && typeof source === 'object') {
    const base = target && typeof target === 'object' && !Array.isArray(target)
        ? cloneValue(target)
        : {}

    Object.keys(source).forEach((key) => {
      base[key] = deepMerge(base[key], source[key])
    })

    return base
  }

  return source
}

const previewForm = computed(() => {
  return deepMerge(currentForm.value, sanitizedSuggestions.value)
})

const changedEntries = computed(() => {
  return editableFields.value
      .map((field) => {
        const currentValue = currentForm.value[field.name]
        const suggestedValue = previewForm.value[field.name]

        if (isEqualValue(currentValue, suggestedValue)) {
          return null
        }

        return {
          field,
          currentValue,
          suggestedValue,
        }
      })
      .filter(Boolean) as Array<{
    field: IEntityCrudField
    currentValue: any
    suggestedValue: any
  }>
})

const canSubmit = computed(() => {
  return prompt.value.trim().length > 0 && editableFields.value.length > 0 && !loading.value
})

const showCurrentValues = computed(() => {
  return operation.value === 'edit'
})

const subtitle = computed(() => {
  const entityName = te(`${entity.name.toLowerCase()}.entity`)
      ? t(`${entity.name.toLowerCase()}.entity`)
      : entity.name

  return operation.value === 'edit'
      ? `Editar ${entityName} con ayuda de IA`
      : `Completar ${entityName} con ayuda de IA`
})

function formatValue(value: any) {
  if (value === undefined || value === null || value === '') {
    return '-'
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }

  return String(value)
}

async function generateSuggestions() {
  if (!canSubmit.value) {
    return
  }

  loading.value = true
  error.value = ""
  response.value = null

  try {
    response.value = await httpClient.post('/api/ai/prompt/crud', {
      prompt: prompt.value.trim(),
      operation: operation.value === 'edit' ? 'edit' : 'create',
      entity: {
        name: entity.name,
        identifier: entity.identifier,
      },
      currentValues: currentForm.value,
      fields: editableFields.value.map(normalizeField),
    }, {}) as CrudAiResponse
  } catch (e: any) {
    error.value = e?.message || 'No se pudo obtener una sugerencia de IA'
    response.value = null
  } finally {
    loading.value = false
  }
}

function applySuggestions() {
  emit('apply', previewForm.value)
  expanded.value = false
}

function resetPanelState() {
  prompt.value = ""
  response.value = null
  error.value = ""
  loading.value = false
}

watch(expanded, (value) => {
  if (!value) {
    resetPanelState()
  }
})

watch(prompt, () => {
  response.value = null
  error.value = ""
})
</script>

<template>
  <v-expand-transition>
    <div v-if="expanded" class="mb-4">
      <v-card variant="tonal" class="crud-ai-panel">
        <v-card-text>
          <div class="d-flex align-center mb-4">
            <div class="text-subtitle-1">{{ subtitle }}</div>
            <v-spacer />
            <v-btn icon="mdi-close" variant="text" @click="expanded = false" />
          </div>

          <v-alert
              v-if="error"
              type="error"
              variant="tonal"
              class="mb-4"
              :text="error"
          />

          <v-alert
              v-if="editableFields.length === 0"
              type="warning"
              variant="tonal"
              class="mb-4"
              :text="te('ai.noEditableFields') ? t('ai.noEditableFields') : 'No hay campos editables disponibles para asistir con IA.'"
          />

          <v-textarea
              v-model="prompt"
              rows="3"
              auto-grow
              variant="outlined"
              :label="te('ai.prompt') ? t('ai.prompt') : 'Prompt'"
              :placeholder="te('ai.promptPlaceholder') ? t('ai.promptPlaceholder') : 'Ejemplo: completá este formulario para un producto premium orientado a pequeñas empresas.'"
          />

          <div class="d-flex justify-end mt-2">
            <v-btn
                color="primary"
                variant="flat"
                :loading="loading"
                :disabled="!canSubmit"
                @click="generateSuggestions"
            >
              {{ te('action.generate') ? t('action.generate') : 'Generar sugerencia' }}
            </v-btn>
          </div>

          <v-card v-if="response" variant="outlined" class="mt-6">
            <v-card-title>
              {{ te('ai.preview') ? t('ai.preview') : 'Vista previa' }}
            </v-card-title>

            <v-card-text>
              <v-alert
                  v-if="response.message"
                  variant="tonal"
                  type="info"
                  class="mb-4"
                  :text="response.message"
              />

              <v-alert
                  v-if="changedEntries.length === 0"
                  variant="tonal"
                  type="info"
                  :text="te('ai.noChanges') ? t('ai.noChanges') : 'La IA no propuso cambios aplicables para este formulario.'"
              />

              <v-list v-else lines="three">
                <v-list-item
                    v-for="entry in changedEntries"
                    :key="entry.field.name"
                    class="px-0"
                >
                  <v-list-item-title>
                    {{ entry.field.label || entry.field.name }}
                  </v-list-item-title>
                  <div class="mt-1 preview-block">
                    <template v-if="showCurrentValues">
                      <div class="text-caption text-medium-emphasis">Actual</div>
                      <pre class="value-preview">{{ formatValue(entry.currentValue) }}</pre>
                    </template>
                    <div class="text-caption text-medium-emphasis mt-2">Sugerido</div>
                    <pre class="value-preview">{{ formatValue(entry.suggestedValue) }}</pre>
                  </div>
                </v-list-item>
              </v-list>

              <div v-if="(response.warnings || []).length > 0" class="mt-4">
                <v-alert
                    v-for="warning in response.warnings || []"
                    :key="warning"
                    variant="tonal"
                    type="warning"
                    class="mb-3"
                    :text="warning"
                />
              </div>
            </v-card-text>
          </v-card>
        </v-card-text>

        <v-card-actions v-if="response">
          <v-spacer />
          <v-btn variant="text" @click="expanded = false">
            {{ t('action.cancel') }}
          </v-btn>
          <v-btn
              color="primary"
              variant="flat"
              :disabled="changedEntries.length === 0"
              @click="applySuggestions"
          >
            {{ te('action.apply') ? t('action.apply') : 'Aplicar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </v-expand-transition>
</template>

<style scoped>
.crud-ai-panel {
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.value-preview {
  margin: 0;
  padding: 8px 12px;
  white-space: pre-wrap;
  word-break: break-word;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.04);
  font-family: inherit;
}

.preview-block {
  white-space: normal;
}
</style>
