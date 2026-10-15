<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref, watch} from 'vue'
import {VBtn, VIcon, VInput} from 'vuetify/components'
import DOMPurify from 'dompurify'

type InputProps = InstanceType<typeof VInput>['$props']

const props = withDefaults(defineProps<{
  modelValue?: string | null
  label?: string
  name?: string
  rows?: number | string
  readonly?: boolean
  disabled?: boolean
  rules?: InputProps['rules']
  errorMessages?: string | string[]
  hint?: string
  persistentHint?: boolean
  placeholder?: string
  persistentPlaceholder?: boolean
  hideDetails?: boolean | 'auto'
  density?: InputProps['density']
  variant?: 'outlined' | 'filled' | 'plain' | 'underlined' | 'solo' | 'solo-inverted' | 'solo-filled'
  clearable?: boolean
  singleLine?: boolean
  prependIcon?: InputProps['prependIcon']
  appendIcon?: InputProps['appendIcon']
  prependInnerIcon?: InputProps['prependIcon']
  appendInnerIcon?: InputProps['appendIcon']
  clearIcon?: InputProps['prependIcon']
}>(), {
  rows: 5,
  variant: 'outlined',
  clearIcon: 'mdi-close',
  // Undefined lets VInput inherit these states from VForm.
  readonly: undefined,
  disabled: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:text': [value: string]
  touched: [value: boolean]
}>()

const editorRef = ref<HTMLDivElement>()
const inputRef = ref<InstanceType<typeof VInput>>()
const focused = ref(false)
const html = ref('')
let savedSelection: Range | null = null
const minHeight = computed(() => `${Math.max(1, Number(props.rows) || 5) * 1.5}em`)

const commands = [
  {command: 'undo', title: 'Deshacer', icon: 'mdi-undo'},
  {command: 'redo', title: 'Rehacer', icon: 'mdi-redo'},
  {command: 'bold', title: 'Negrita', icon: 'mdi-format-bold'},
  {command: 'italic', title: 'Cursiva', icon: 'mdi-format-italic'},
  {command: 'underline', title: 'Subrayado', icon: 'mdi-format-underline'},
  {command: 'strikeThrough', title: 'Tachado', icon: 'mdi-format-strikethrough'},
  {command: 'insertUnorderedList', title: 'Lista con viñetas', icon: 'mdi-format-list-bulleted'},
  {command: 'insertOrderedList', title: 'Lista numerada', icon: 'mdi-format-list-numbered'},
  {command: 'formatBlock', value: 'blockquote', title: 'Cita', icon: 'mdi-format-quote-close'},
  {command: 'outdent', title: 'Reducir sangría', icon: 'mdi-format-indent-decrease'},
  {command: 'indent', title: 'Aumentar sangría', icon: 'mdi-format-indent-increase'},
  {command: 'justifyLeft', title: 'Alinear a la izquierda', icon: 'mdi-format-align-left'},
  {command: 'justifyCenter', title: 'Centrar', icon: 'mdi-format-align-center'},
  {command: 'justifyRight', title: 'Alinear a la derecha', icon: 'mdi-format-align-right'},
  {command: 'justifyFull', title: 'Justificar', icon: 'mdi-format-align-justify'},
  {command: 'removeFormat', title: 'Limpiar formato', icon: 'mdi-format-clear'},
]
const fonts = ['Arial', 'Verdana', 'Georgia', 'Times New Roman', 'Courier New']
const sizes = [
  {value: '2', title: 'Pequeño'}, {value: '3', title: 'Normal'},
  {value: '5', title: 'Grande'}, {value: '7', title: 'Muy grande'},
]

function sanitize(value: string) {
  if (typeof window === 'undefined' || !DOMPurify.isSupported) return ''
  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: ['p', 'div', 'br', 'span', 'b', 'strong', 'i', 'em', 'u', 's', 'strike',
      'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'font', 'h1', 'h2', 'h3',
      'h4', 'h5', 'h6', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'hr'],
    ALLOWED_ATTR: ['href', 'title', 'style', 'color', 'face', 'size', 'align', 'colspan', 'rowspan'],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
  })
}

function syncModel(value: string | null | undefined) {
  html.value = sanitize(value || '')
  if (editorRef.value && editorRef.value.innerHTML !== html.value) {
    editorRef.value.innerHTML = html.value
    savedSelection = null
  }
}
watch(() => props.modelValue, syncModel, {immediate: true})

function isBlocked() {
  // VInput's validation classes also reflect inherited VForm state.
  const classes = inputRef.value?.$el?.classList
  return props.readonly || props.disabled || classes?.contains('v-input--readonly') ||
    classes?.contains('v-input--disabled')
}

function focusEditor() {
  if (!props.disabled && !inputRef.value?.$el?.classList.contains('v-input--disabled')) {
    editorRef.value?.focus()
  }
}

function saveEditorSelection() {
  if (typeof window === 'undefined' || !editorRef.value) return
  const selection = window.getSelection()
  if (!selection?.rangeCount) return
  const range = selection.getRangeAt(0)
  if (editorRef.value.contains(range.startContainer) && editorRef.value.contains(range.endContainer)) {
    savedSelection = range.cloneRange()
  }
}

function restoreEditorSelection() {
  const editor = editorRef.value
  if (typeof window === 'undefined' || !editor) return
  const selection = window.getSelection()
  if (!selection) return
  const range = savedSelection && editor.contains(savedSelection.startContainer) &&
    editor.contains(savedSelection.endContainer) ? savedSelection : document.createRange()
  if (range !== savedSelection) {
    range.selectNodeContents(editor)
    range.collapse(false)
  }
  selection.removeAllRanges()
  selection.addRange(range)
}

function onInput() {
  const editor = editorRef.value
  if (!editor) return
  if (isBlocked()) {
    syncModel(props.modelValue)
    return
  }
  const clean = sanitize(editor.innerHTML)
  if (editor.innerHTML !== clean) {
    editor.innerHTML = clean
    savedSelection = null
  }
  const text = editor.innerText ?? editor.textContent ?? ''
  // Browsers leave <br> or empty blocks behind after deleting the last character.
  html.value = text.replace(/\u00a0/g, ' ').trim() || editor.querySelector('hr, table') ? clean : ''
  emit('update:modelValue', html.value)
  emit('update:text', text)
  emit('touched', true)
  saveEditorSelection()
}

function applyFormat(command: string, value?: string) {
  if (isBlocked() || typeof document === 'undefined' || !editorRef.value) return
  focusEditor()
  restoreEditorSelection()
  if (typeof document.execCommand === 'function') {
    document.execCommand(command, false, command === 'insertHTML' ? sanitize(value || '') : value)
    onInput()
  }
}

function insertHtml(value: string) {
  if (isBlocked() || !editorRef.value || typeof document === 'undefined') return
  focusEditor()
  restoreEditorSelection()
  const clean = sanitize(value)
  if (typeof document.execCommand === 'function' && document.execCommand('insertHTML', false, clean)) {
    onInput()
    return
  }
  // Some environments lack execCommand; insert only the DOMPurify-cleaned fragment.
  const selection = window.getSelection()
  if (!selection?.rangeCount) return
  const range = selection.getRangeAt(0)
  const fragment = range.createContextualFragment(clean)
  const lastNode = fragment.lastChild
  range.deleteContents()
  range.insertNode(fragment)
  if (lastNode) range.setStartAfter(lastNode)
  range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(range)
  onInput()
}

function onPaste(event: ClipboardEvent) {
  event.preventDefault()
  if (isBlocked()) return
  saveEditorSelection()
  const pastedHtml = event.clipboardData?.getData('text/html')
  const text = event.clipboardData?.getData('text/plain') || ''
  const clean = pastedHtml ? sanitize(pastedHtml) : ''
  // Escaping here is only for plain text; HTML sanitization belongs to DOMPurify.
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/\r\n?|\n/g, '<br>')
  insertHtml(clean || escaped)
}

function clear() {
  if (isBlocked() || !editorRef.value) return
  editorRef.value.innerHTML = ''
  savedSelection = null
  onInput()
  focusEditor()
}

function onValidationModelUpdate(value: string | null) {
  if (isBlocked()) return
  syncModel(value)
  emit('update:modelValue', html.value)
  emit('update:text', editorRef.value?.innerText ?? editorRef.value?.textContent ?? '')
}

function onBlur() {
  focused.value = false
  if (!isBlocked()) emit('touched', true)
}

onMounted(() => {
  syncModel(props.modelValue)
  document.addEventListener('selectionchange', saveEditorSelection)
})
onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.removeEventListener('selectionchange', saveEditorSelection)
  savedSelection = null
})

defineExpose({focus: focusEditor, focusEditor, applyFormat, clear})
</script>

<template>
  <VInput
    ref="inputRef"
    class="html-editor"
    :model-value="html"
    :name="name"
    :label="label"
    :rules="rules"
    :readonly="readonly"
    :disabled="disabled"
    :error-messages="errorMessages"
    :hint="hint"
    :persistent-hint="persistentHint"
    :hide-details="hideDetails"
    :density="density"
    :focused="focused"
    :prepend-icon="prependIcon"
    :append-icon="appendIcon"
    @update:model-value="onValidationModelUpdate"
  >
    <template #default="{id, messagesId, isValid, isDisabled, isReadonly}">
      <div
        class="html-editor__field"
        :class="[`html-editor__field--${variant}`, {'html-editor__field--error': isValid.value === false,
          'html-editor__field--focused': focused, 'html-editor__field--disabled': isDisabled.value}]"
      >
        <label v-if="label" :id="`${id.value}-label`" :for="id.value" class="html-editor__label" :class="{'html-editor__label--single': singleLine}">
          {{ label }}
        </label>
        <div class="html-editor__toolbar" role="toolbar" aria-label="Formato de texto" @pointerdown.capture="saveEditorSelection" @focusin="saveEditorSelection">
          <VBtn
            v-for="item in commands" :key="item.command"
            :icon="item.icon" :title="item.title" :aria-label="item.title"
            variant="text" size="small" :disabled="isDisabled.value || isReadonly.value"
            @mousedown.prevent @click="applyFormat(item.command, item.value)"
          />
          <select aria-label="Fuente" title="Fuente" :disabled="isDisabled.value || isReadonly.value" @change="applyFormat('fontName', ($event.target as HTMLSelectElement).value)">
            <option value="" disabled selected>Fuente</option>
            <option v-for="font in fonts" :key="font" :value="font">{{ font }}</option>
          </select>
          <select aria-label="Tamaño de fuente" title="Tamaño de fuente" :disabled="isDisabled.value || isReadonly.value" @change="applyFormat('fontSize', ($event.target as HTMLSelectElement).value)">
            <option value="" disabled selected>Tamaño</option>
            <option v-for="size in sizes" :key="size.value" :value="size.value">{{ size.title }}</option>
          </select>
          <input type="color" aria-label="Color de texto" title="Color de texto" :disabled="isDisabled.value || isReadonly.value" @change="applyFormat('foreColor', ($event.target as HTMLInputElement).value)">
        </div>
        <div class="html-editor__content">
          <VIcon v-if="prependInnerIcon" :icon="prependInnerIcon" class="html-editor__inner-icon" />
          <div
            :id="id.value" ref="editorRef" class="html-editor__body"
            role="textbox" aria-multiline="true"
            :aria-labelledby="label ? `${id.value}-label` : undefined"
            :aria-label="label ? undefined : (placeholder || 'Editor de texto')"
            :aria-describedby="messagesId.value"
            :aria-invalid="isValid.value === false"
            :aria-readonly="isReadonly.value" :aria-disabled="isDisabled.value"
            :aria-placeholder="placeholder"
            :contenteditable="!isDisabled.value && !isReadonly.value"
            :tabindex="isDisabled.value ? -1 : 0"
            :data-placeholder="persistentPlaceholder || focused || !label ? placeholder : undefined"
            :style="{minHeight}"
            @focus="focused = true" @blur="onBlur"
            @input="onInput" @paste="onPaste" @drop.prevent
            @beforeinput="(isDisabled.value || isReadonly.value) && $event.preventDefault()"
          />
          <VBtn v-if="clearable && html && !isReadonly.value" :icon="clearIcon" title="Borrar contenido" aria-label="Borrar contenido" variant="text" size="small" :disabled="isDisabled.value" @mousedown.prevent @click="clear" />
          <VIcon v-if="appendInnerIcon" :icon="appendInnerIcon" class="html-editor__inner-icon" />
        </div>
        <input v-if="name" type="hidden" :name="name" :value="html" :disabled="isDisabled.value">
      </div>
    </template>
  </VInput>
</template>

<style scoped>
.html-editor :deep(.v-input__control) { min-width: 0; }
.html-editor__field { width: 100%; min-width: 0; border: 1px solid rgba(var(--v-theme-on-surface), .38); border-radius: 4px; }
.html-editor__field--filled, .html-editor__field--solo-filled { background: rgba(var(--v-theme-on-surface), .05); }
.html-editor__field--solo, .html-editor__field--solo-inverted, .html-editor__field--solo-filled { box-shadow: 0 2px 4px rgba(0, 0, 0, .15); border-color: transparent; }
.html-editor__field--solo-inverted { background: rgba(var(--v-theme-on-surface), .1); }
.html-editor__field--plain { border-color: transparent; }
.html-editor__field--underlined { border-width: 0 0 1px; border-radius: 0; }
.html-editor__field--focused { border-color: rgb(var(--v-theme-primary)); }
.html-editor__field--error { border-color: rgb(var(--v-theme-error)); }
.html-editor__field--disabled { opacity: .5; }
.html-editor__label { display: block; padding: 8px 12px 0; font-size: .875rem; }
.html-editor__label--single { font-size: 1rem; }
.html-editor__toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 2px; padding: 4px; border-bottom: 1px solid rgba(var(--v-theme-on-surface), .12); }
.html-editor__toolbar select { max-width: 150px; border: 1px solid rgba(var(--v-theme-on-surface), .25); border-radius: 4px; padding: 4px; color: inherit; }
.html-editor__toolbar option { color: rgb(var(--v-theme-on-surface)); background: rgb(var(--v-theme-surface)); }
.html-editor__toolbar input[type=color] { width: 32px; height: 28px; cursor: pointer; }
.html-editor__toolbar :disabled { cursor: default; opacity: .5; }
.html-editor__content { display: flex; align-items: flex-start; }
.html-editor__inner-icon { margin: 12px 8px; }
.html-editor__body { flex: 1; min-width: 0; padding: 12px; outline: none; overflow-wrap: anywhere; white-space: pre-wrap; }
.html-editor__body:empty::before { content: attr(data-placeholder); opacity: .5; pointer-events: none; }
.html-editor.v-input--density-compact .html-editor__body { padding: 8px; }
.html-editor.v-input--density-comfortable .html-editor__body { padding: 10px; }
.html-editor__body :deep(ul), .html-editor__body :deep(ol) { padding-left: 24px; }
.html-editor__body :deep(blockquote) { border-left: 3px solid rgba(var(--v-theme-on-surface), .3); padding-left: 12px; margin: 8px 0; }
.html-editor__body :deep(table) { border-collapse: collapse; max-width: 100%; }
.html-editor__body :deep(td), .html-editor__body :deep(th) { border: 1px solid rgba(var(--v-theme-on-surface), .25); padding: 4px 8px; }
</style>
