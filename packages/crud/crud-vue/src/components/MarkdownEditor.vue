<script setup lang="ts">
import {computed, nextTick, ref, watch, type PropType} from 'vue'
import {VBtn, VTextarea} from 'vuetify/components'
import type {ValidationRule} from 'vuetify'
import {useForm} from 'vuetify/lib/composables/form.js'
import {marked} from 'marked'
import DOMPurify from 'dompurify'

type TextareaProps = InstanceType<typeof VTextarea>['$props']

const props = defineProps({
  modelValue: {type: String as PropType<string | null>, default: null},
  name: String,
  label: String,
  rows: {type: [Number, String], default: 5},
  readonly: {type: Boolean, default: undefined},
  disabled: {type: Boolean, default: undefined},
  rules: {type: Array as PropType<ValidationRule[]>, default: () => []},
  errorMessages: {type: [String, Array] as PropType<string | string[]>, default: () => []},
  hint: String,
  persistentHint: {type: Boolean, default: false},
  placeholder: String,
  persistentPlaceholder: {type: Boolean, default: false},
  hideDetails: {type: [Boolean, String] as PropType<boolean | 'auto'>, default: false},
  density: {type: String as PropType<TextareaProps['density']>, default: 'default'},
  variant: {type: String as PropType<TextareaProps['variant']>, default: 'filled'},
  clearable: {type: Boolean, default: false},
  singleLine: {type: Boolean, default: false},
  prependIcon: {type: [String, Function, Object, Array] as PropType<TextareaProps['prependIcon']>},
  appendIcon: {type: [String, Function, Object, Array] as PropType<TextareaProps['appendIcon']>},
  prependInnerIcon: {type: [String, Function, Object, Array] as PropType<TextareaProps['prependInnerIcon']>},
  appendInnerIcon: {type: [String, Function, Object, Array] as PropType<TextareaProps['appendInnerIcon']>},
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  touched: []
}>()

const value = ref(props.modelValue ?? '')
const preview = ref(false)
const input = ref<InstanceType<typeof VTextarea> | null>(null)
// Read the same inherited state as VTextarea without registering another form input.
const {isReadonly, isDisabled} = useForm({
  get readonly() { return props.readonly ?? null },
  get disabled() { return props.disabled ?? null },
})
const editingBlocked = computed(() => isReadonly.value || isDisabled.value)
let selection = {start: 0, end: 0}

watch(() => props.modelValue, newValue => {
  value.value = newValue ?? ''
})

// Per-render options avoid changing marked defaults or DOMPurify's global hooks.
const previewHtml = computed(() => {
  // DOMPurify has no browser sanitizer in SSR; never fall back to unsanitized HTML.
  if (typeof window === 'undefined') return ''
  return DOMPurify.sanitize(
    marked.parse(value.value, {async: false, gfm: true}),
    {USE_PROFILES: {html: true}, FORBID_TAGS: ['style', 'form', 'input', 'button', 'textarea']},
  )
})

const actions = [
  {id: 'heading', label: 'Encabezado', icon: 'mdi-format-header-2'},
  {id: 'bold', label: 'Negrita', icon: 'mdi-format-bold'},
  {id: 'italic', label: 'Cursiva', icon: 'mdi-format-italic'},
  {id: 'strike', label: 'Tachado', icon: 'mdi-format-strikethrough'},
  {id: 'bulleted', label: 'Lista con viñetas', icon: 'mdi-format-list-bulleted'},
  {id: 'numbered', label: 'Lista numerada', icon: 'mdi-format-list-numbered'},
  {id: 'quote', label: 'Cita', icon: 'mdi-format-quote-close'},
  {id: 'link', label: 'Enlace', icon: 'mdi-link'},
  {id: 'inline-code', label: 'Código en línea', icon: 'mdi-code-tags'},
  {id: 'code-block', label: 'Bloque de código', icon: 'mdi-code-braces'},
  {id: 'table', label: 'Tabla', icon: 'mdi-table'},
]

function textarea() {
  return input.value?.$el.querySelector('textarea') as HTMLTextAreaElement | null
}

function rememberSelection() {
  const element = textarea()
  if (element) selection = {start: element.selectionStart, end: element.selectionEnd}
}

function updateValue(newValue: string | null) {
  if (editingBlocked.value) return
  value.value = newValue ?? ''
  emit('update:modelValue', newValue)
  emit('touched')
}

async function restoreSelection(start: number, end: number) {
  await nextTick()
  const element = textarea()
  if (!element || preview.value || isDisabled.value) return
  element.focus()
  element.setSelectionRange(start, end)
  selection = {start, end}
}

async function setPreview(active: boolean) {
  if (active) rememberSelection()
  preview.value = active
  if (!active) await restoreSelection(selection.start, selection.end)
}

async function insert(action: string) {
  if (editingBlocked.value || preview.value) return
  rememberSelection()
  const text = value.value
  let start = Math.min(selection.start, text.length)
  let end = Math.min(selection.end, text.length)
  let selected = text.slice(start, end)
  let replacement = ''
  let offset = 0
  let length = selected.length

  if (['heading', 'bulleted', 'numbered', 'quote'].includes(action)) {
    start = start === 0 ? 0 : text.lastIndexOf('\n', start - 1) + 1
    // A selection ending at the next line's start does not include that line.
    const last = end > start && text[end - 1] === '\n' ? end - 1 : end
    const lineEnd = text.indexOf('\n', last)
    end = lineEnd === -1 ? text.length : lineEnd
    selected = text.slice(start, end)
    replacement = selected.split('\n').map((line, index) => {
      const prefix = action === 'heading' ? '## ' : action === 'quote' ? '> ' : action === 'numbered' ? `${index + 1}. ` : '- '
      return prefix + line
    }).join('\n')
    length = replacement.length
  } else if (action === 'code-block' || action === 'table') {
    const prefix = start > 0 && text[start - 1] !== '\n' ? '\n\n' : ''
    const suffix = end < text.length && text[end] !== '\n' ? '\n\n' : '\n'
    if (action === 'code-block') {
      const content = selected || 'código'
      const fence = '`'.repeat(Math.max(3, ...Array.from(content.matchAll(/`+/g), match => match[0].length + 1)))
      replacement = `${prefix}${fence}\n${content}\n${fence}${suffix}`
      offset = prefix.length + fence.length + 1
      length = content.length
    } else {
      replacement = `${prefix}| Columna 1 | Columna 2 |\n| --- | --- |\n| ${selected.replace(/\|/g, '\\|').replace(/\n/g, ' ') || 'Texto'} | Texto |${suffix}`
      offset = prefix.length
      length = replacement.length - prefix.length - suffix.length
    }
  } else {
    const markers: Record<string, [string, string, string]> = {
      bold: ['**', '**', 'texto'],
      italic: ['*', '*', 'texto'],
      strike: ['~~', '~~', 'texto'],
      link: ['[', '](https://example.com)', 'enlace'],
      'inline-code': ['`', '`', 'código'],
    }
    const marker = markers[action]
    if (!marker) return
    let [before, after, fallback] = marker
    const content = selected || fallback
    if (action === 'inline-code') {
      const fence = '`'.repeat(Math.max(1, ...Array.from(content.matchAll(/`+/g), match => match[0].length + 1)))
      const padding = /^[` ]|[` ]$/.test(content) ? ' ' : ''
      before = fence + padding
      after = padding + fence
    }
    replacement = before + content + after
    offset = before.length
    length = content.length
  }

  updateValue(text.slice(0, start) + replacement + text.slice(end))
  await restoreSelection(start + offset, start + offset + length)
}

function onKeydown(event: KeyboardEvent) {
  if (!(event.ctrlKey || event.metaKey) || event.altKey || editingBlocked.value || preview.value) return
  const key = event.key.toLowerCase()
  if (key === 'b' || key === 'i') {
    event.preventDefault()
    void insert(key === 'b' ? 'bold' : 'italic')
  }
}
</script>

<template>
  <div class="markdown-editor">
    <div class="markdown-editor__toolbar" role="toolbar" aria-label="Editor Markdown">
      <v-btn type="button" size="small" variant="text" :aria-pressed="!preview" @click="setPreview(false)">
        Edición
      </v-btn>
      <v-btn type="button" size="small" variant="text" :aria-pressed="preview" @click="setPreview(true)">
        Vista previa
      </v-btn>
      <template v-if="!isReadonly && !preview">
        <v-btn
            v-for="action in actions"
            :key="action.id"
            type="button"
            size="small"
            variant="text"
            :icon="action.icon"
            :title="action.label"
            :aria-label="action.label"
            :disabled="isDisabled"
            @mousedown.prevent
            @click="insert(action.id)"
        />
      </template>
    </div>
    <div
        v-if="preview"
        class="markdown-editor__preview"
        role="region"
        :aria-label="label ? `${label}: vista previa` : 'Vista previa de Markdown'"
        v-html="previewHtml"
    />
    <!-- Hide only the field so the single registered input still displays its details. -->
    <v-textarea
        ref="input"
        class="markdown-editor__input"
        :class="{'markdown-editor__input--preview': preview}"
        :model-value="value"
        :name="name"
        :label="label"
        :rows="rows"
        :readonly="readonly"
        :disabled="disabled"
        :rules="rules"
        :error-messages="errorMessages"
        :hint="hint"
        :persistent-hint="persistentHint"
        :placeholder="placeholder"
        :persistent-placeholder="persistentPlaceholder"
        :hide-details="hideDetails"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :single-line="singleLine"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
        @update:model-value="updateValue"
        @blur="emit('touched')"
        @select="rememberSelection"
        @keyup="rememberSelection"
        @click="rememberSelection"
        @keydown="onKeydown"
    />
  </div>
</template>

<style scoped>
.markdown-editor__input--preview :deep(.v-field) {
  display: none;
}

.markdown-editor__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}

.markdown-editor__preview {
  min-height: 8rem;
  padding: 16px;
  overflow-wrap: anywhere;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.25);
  border-radius: 4px;
}

.markdown-editor__preview :deep(pre) {
  padding: 12px;
  overflow-x: auto;
  background: rgba(var(--v-theme-on-surface), 0.06);
}

.markdown-editor__preview :deep(table) {
  display: block;
  overflow-x: auto;
  border-collapse: collapse;
}

.markdown-editor__preview :deep(th),
.markdown-editor__preview :deep(td) {
  padding: 6px 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.25);
}

.markdown-editor__preview :deep(blockquote) {
  margin: 8px 0;
  padding-left: 16px;
  border-left: 4px solid rgba(var(--v-theme-on-surface), 0.25);
}

.markdown-editor__preview :deep(ul),
.markdown-editor__preview :deep(ol) {
  padding-left: 24px;
}

.markdown-editor__preview :deep(img) {
  max-width: 100%;
}
</style>
