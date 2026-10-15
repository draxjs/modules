import {defineComponent, h, nextTick, ref} from 'vue'
import {mount} from '@vue/test-utils'
import {describe, expect, it, vi} from 'vitest'
import DOMPurify from 'dompurify'
import {createVuetify} from 'vuetify'
import {VForm, VTextarea} from 'vuetify/components'
import MarkdownEditor from './MarkdownEditor.vue'

function editor(props = {}) {
  return mount(MarkdownEditor, {
    props,
    global: {plugins: [createVuetify()]},
  })
}

describe('MarkdownEditor', () => {
  it('normalizes null and synchronizes external changes without emitting', async () => {
    const wrapper = editor({modelValue: null})
    expect(wrapper.find('textarea').element.value).toBe('')
    expect(wrapper.findComponent(VTextarea).props('rows')).toBe(5)
    await wrapper.setProps({modelValue: 'Externo'})
    expect(wrapper.find('textarea').element.value).toBe('Externo')
    await wrapper.setProps({modelValue: null})
    expect(wrapper.find('textarea').element.value).toBe('')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('touched')).toBeUndefined()
    wrapper.unmount()
  })

  it.each([
    ['Negrita', '**mundo**'],
    ['Cursiva', '*mundo*'],
    ['Tachado', '~~mundo~~'],
    ['Enlace', '[mundo](https://example.com)'],
    ['Código en línea', '`mundo`'],
  ])('inserts %s at the actual selection and restores it', async (label, replacement) => {
    const wrapper = editor({modelValue: 'Hola mundo!'})
    const textarea = wrapper.find('textarea').element
    textarea.setSelectionRange(5, 10)
    await wrapper.find(`button[aria-label="${label}"]`).trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[`Hola ${replacement}!`]])
    expect(wrapper.emitted('touched')).toHaveLength(1)
    expect(textarea.value.slice(textarea.selectionStart, textarea.selectionEnd)).toBe('mundo')
    wrapper.unmount()
  })

  it.each([
    ['Encabezado', '## uno\n## dos'],
    ['Lista con viñetas', '- uno\n- dos'],
    ['Lista numerada', '1. uno\n2. dos'],
    ['Cita', '> uno\n> dos'],
  ])('formats selected lines with %s', async (label, expected) => {
    const wrapper = editor({modelValue: 'uno\ndos'})
    wrapper.find('textarea').element.setSelectionRange(0, 7)
    await wrapper.find(`button[aria-label="${label}"]`).trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[expected]])
    wrapper.unmount()
  })

  it.each(['Bloque de código', 'Tabla'])('inserts %s and renders it as Markdown', async label => {
    const wrapper = editor({modelValue: 'ejemplo'})
    wrapper.find('textarea').element.setSelectionRange(0, 7)
    await wrapper.find(`button[aria-label="${label}"]`).trigger('click')
    await wrapper.findAll('button').find(button => button.text() === 'Vista previa')!.trigger('click')
    const preview = wrapper.find('.markdown-editor__preview')
    expect(preview.find(label === 'Tabla' ? 'table' : 'pre code').exists()).toBe(true)
    expect(preview.text()).toContain('ejemplo')
    wrapper.unmount()
  })

  it('emits input, clear and keyboard formatting changes with touched', async () => {
    const wrapper = editor({clearable: true})
    await wrapper.find('textarea').setValue('texto')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['texto'])
    wrapper.find('textarea').element.setSelectionRange(0, 5)
    await wrapper.find('textarea').trigger('keydown', {key: 'b', ctrlKey: true})
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual(['**texto**'])
    wrapper.findComponent(VTextarea).vm.$emit('update:modelValue', null)
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.[2]).toEqual([null])
    expect(wrapper.emitted('touched')).toHaveLength(3)
    wrapper.unmount()
  })

  it('sanitizes raw HTML and unsafe links without changing Markdown input', async () => {
    const markdown = '# Título\n\n[seguro](https://example.com)\n\n[malo](javascript:alert%281%29)\n\n<script>alert(1)</script><img src=x onerror="alert(1)"><a href="jav&#x61;script:alert(1)">HTML</a>'
    const wrapper = editor({modelValue: markdown})
    const input = wrapper.find('textarea').element
    await wrapper.findAll('button').find(button => button.text() === 'Vista previa')!.trigger('click')
    const preview = wrapper.find('.markdown-editor__preview')
    expect(preview.find('h1').text()).toBe('Título')
    expect(preview.find('script').exists()).toBe(false)
    expect(preview.find('[onerror]').exists()).toBe(false)
    expect(preview.findAll('a').some(link => /javascript:/i.test(link.attributes('href') ?? ''))).toBe(false)
    expect(preview.find('a').attributes('href')).toBe('https://example.com')
    expect(wrapper.find('textarea').element).toBe(input)
    expect(wrapper.findComponent(VTextarea).isVisible()).toBe(true)
        expect(wrapper.findComponent(VTextarea).classes()).toContain('markdown-editor__input--preview')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it.each([{readonly: true}, {disabled: true}])('prevents editing with %j but permits preview', async props => {
    const wrapper = editor({...props, modelValue: '**texto**'})
    if (props.readonly) expect(wrapper.find('button[aria-label="Negrita"]').exists()).toBe(false)
    else expect(wrapper.find('button[aria-label="Negrita"]').attributes('disabled')).toBeDefined()
    await wrapper.find('textarea').trigger('keydown', {key: 'b', metaKey: true})
    await wrapper.findAll('button').find(button => button.text() === 'Vista previa')!.trigger('click')
    expect(wrapper.find('.markdown-editor__preview strong').text()).toBe('texto')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('keeps exactly one input registered and validates while preview is active', async () => {
    const form = ref<InstanceType<typeof VForm> | null>(null)
    const wrapper = mount(defineComponent({
      setup: () => () => h(VForm, {ref: form}, {
        default: () => h(MarkdownEditor, {modelValue: '', rules: [value => !!value || 'Obligatorio']}),
      }),
    }), {global: {plugins: [createVuetify()]}})
    await wrapper.findAll('button').find(button => button.text() === 'Vista previa')!.trigger('click')
    expect(form.value!.items).toHaveLength(1)
    const result = await form.value!.validate()
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].errorMessages).toEqual(['Obligatorio'])
    await nextTick()
    expect(wrapper.find('.v-input__details').isVisible()).toBe(true)
    expect(wrapper.find('.v-input__details').text()).toBe('Obligatorio')
    wrapper.unmount()
  })

  it('keeps hints and external errors visible in preview and honors hideDetails', async () => {
    const wrapper = editor({hint: 'Ayuda Markdown', persistentHint: true})
    const textarea = wrapper.find('textarea').element
    await wrapper.findAll('button').find(button => button.text() === 'Vista previa')!.trigger('click')
    expect(wrapper.find('.v-input__details').isVisible()).toBe(true)
    expect(wrapper.find('.v-input__details').text()).toBe('Ayuda Markdown')
    await wrapper.setProps({errorMessages: ['Error externo']})
    expect(wrapper.find('.v-input__details').isVisible()).toBe(true)
    expect(wrapper.find('.v-input__details').text()).toBe('Error externo')
    await wrapper.setProps({hideDetails: true})
    expect(wrapper.find('.v-input__details').exists()).toBe(false)
    await wrapper.findAll('button').find(button => button.text() === 'Edición')!.trigger('click')
    expect(wrapper.find('textarea').element).toBe(textarea)
    expect(wrapper.findComponent(VTextarea).classes()).not.toContain('markdown-editor__input--preview')
    wrapper.unmount()
  })

  it.each(['readonly', 'disabled'] as const)('reactively inherits %s from VForm and blocks all editing paths', async state => {
    const blocked = ref(false)
    const wrapper = mount(defineComponent({
      setup: () => () => h(VForm, {[state]: blocked.value}, {
        default: () => h(MarkdownEditor, {modelValue: '**texto**'}),
      }),
    }), {global: {plugins: [createVuetify()]}})
    const child = wrapper.findComponent(MarkdownEditor)
    expect(child.find('button[aria-label="Negrita"]').attributes('disabled')).toBeUndefined()
    blocked.value = true
    await nextTick()
    if (state === 'readonly') {
      expect(child.find('button[aria-label="Negrita"]').exists()).toBe(false)
      expect(child.find('textarea').element.readOnly).toBe(true)
    } else {
      const button = child.find('button[aria-label="Negrita"]')
      expect(button.attributes('disabled')).toBeDefined()
      expect(child.find('textarea').element.disabled).toBe(true)
      // Invoke the handler directly as well, bypassing native disabled-button behavior.
      await (child.vm.$.setupState as {insert: (action: string) => Promise<void>}).insert('bold')
    }
    await child.find('textarea').trigger('keydown', {key: 'b', ctrlKey: true})
    child.findComponent(VTextarea).vm.$emit('update:modelValue', 'cambio bloqueado')
    await nextTick()
    expect(child.emitted('update:modelValue')).toBeUndefined()
    expect(child.emitted('touched')).toBeUndefined()
    await child.findAll('button').find(button => button.text() === 'Vista previa')!.trigger('click')
    expect(child.find('.markdown-editor__preview strong').text()).toBe('texto')
    await child.findAll('button').find(button => button.text() === 'Edición')!.trigger('click')
    blocked.value = false
    await nextTick()
    expect(child.find('button[aria-label="Negrita"]').attributes('disabled')).toBeUndefined()
    await child.find('button[aria-label="Negrita"]').trigger('click')
    expect(child.emitted('update:modelValue')).toHaveLength(1)
    wrapper.unmount()
  })

  it('does not call DOMPurify or expose unsanitized HTML without window', () => {
    const wrapper = editor({modelValue: '<script>alert(1)</script>'})
    const sanitize = vi.spyOn(DOMPurify, 'sanitize')
    try {
      vi.stubGlobal('window', undefined)
      // Evaluate the lazy preview computed in a server-like environment.
      expect((wrapper.vm.$.setupState as Record<string, unknown>).previewHtml).toBe('')
      expect(sanitize).not.toHaveBeenCalled()
    } finally {
      vi.unstubAllGlobals()
      sanitize.mockRestore()
      wrapper.unmount()
    }
  })
})
