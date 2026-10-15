import {createSSRApp, defineComponent, h, nextTick, ref} from 'vue'
import {renderToString} from 'vue/server-renderer'
import {flushPromises, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it, vi} from 'vitest'
import {createVuetify} from 'vuetify'
import {VForm, VInput} from 'vuetify/components'
import HtmlEditor from './HtmlEditor.vue'

const wrappers: ReturnType<typeof mount>[] = []
function setup(props: Record<string, unknown> = {}) {
  const wrapper = mount(HtmlEditor, {props, attachTo: document.body, global: {plugins: [createVuetify()]}})
  wrappers.push(wrapper)
  return wrapper
}
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount())
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  delete (document as any).execCommand
})

function paste(wrapper: ReturnType<typeof setup>, html: string, text = '') {
  const event = new Event('paste', {bubbles: true, cancelable: true})
  Object.defineProperty(event, 'clipboardData', {
    value: {getData: (type: string) => type === 'text/html' ? html : text},
  })
  wrapper.get('[role=textbox]').element.dispatchEvent(event)
  return event
}

describe('HtmlEditor', () => {
  it('renders safely without window or document during SSR', async () => {
    // Vuetify has already detected JSDOM at import time; initialize it before hiding globals.
    const app = createSSRApp(HtmlEditor, {modelValue: '<script>bad()</script><b>Hola</b>'})
    app.use(createVuetify({ssr: true}))
    vi.stubGlobal('window', undefined)
    vi.stubGlobal('document', undefined)
    try {
      const output = await renderToString(app)
      expect(output).toContain('role="textbox"')
      expect(output).not.toContain('<script>bad()</script>')
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('sanitizes initial and external HTML without emitting changes', async () => {
    const wrapper = setup({modelValue: '<b>Hola</b><script>alert(1)</script><img src=x onerror=alert(1)>'})
    expect(wrapper.get('[role=textbox]').element.innerHTML).toBe('<b>Hola</b>')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('update:text')).toBeUndefined()
    await wrapper.setProps({modelValue: '<a href="javascript:alert(1)" onclick="bad()">Nuevo</a>'})
    expect(wrapper.get('[role=textbox]').element.innerHTML).toBe('<a>Nuevo</a>')
    expect(wrapper.emitted('touched')).toBeUndefined()
    await wrapper.setProps({modelValue: null})
    expect(wrapper.get('[role=textbox]').element.innerHTML).toBe('')
  })

  it('emits sanitized HTML, plain text and touched on input', async () => {
    const wrapper = setup()
    const editor = wrapper.get('[role=textbox]')
    editor.element.innerHTML = '<b onclick="bad()">Hola</b><script>bad()</script>'
    await editor.trigger('input')
    expect(editor.element.innerHTML).toBe('<b>Hola</b>')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['<b>Hola</b>'])
    expect(wrapper.emitted('update:text')?.at(-1)).toEqual(['Hola'])
    expect(wrapper.emitted('touched')?.at(-1)).toEqual([true])
    editor.element.innerHTML = '<div><br></div>'
    await editor.trigger('input')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([''])
  })

  it('sanitizes HTML paste and escapes the plain-text fallback', () => {
    const wrapper = setup()
    expect(paste(wrapper, '<b>Seguro</b><script>bad()</script>').defaultPrevented).toBe(true)
    expect(wrapper.get('[role=textbox]').element.innerHTML).toBe('<b>Seguro</b>')
    ;(wrapper.vm as any).clear()
    paste(wrapper, '', '<img src=x onerror=bad()>\n& texto')
    expect(wrapper.get('[role=textbox]').element.innerHTML).toBe('&lt;img src=x onerror=bad()&gt;<br>&amp; texto')
    expect(wrapper.get('[role=textbox]').find('img').exists()).toBe(false)
  })

  it.each(['readonly', 'disabled'])('blocks paste, formatting, clear and input when %s', async state => {
    const wrapper = setup({modelValue: '<b>Original</b>', clearable: true, [state]: true})
    const exec = vi.fn()

    Object.defineProperty(document, 'execCommand', {value: exec, configurable: true})
    ;(wrapper.vm as any).applyFormat('bold')
    ;(wrapper.vm as any).clear()
    paste(wrapper, '<i>Nuevo</i>')
    const editor = wrapper.get('[role=textbox]')
    expect(editor.attributes('contenteditable')).toBe('false')
    editor.element.innerHTML = 'Manipulado'
    await editor.trigger('input')
    expect(editor.element.innerHTML).toBe('<b>Original</b>')
    expect(exec).not.toHaveBeenCalled()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

  })

  it('restores a saved selection when a toolbar command runs', () => {
    const wrapper = setup({modelValue: '<b>Texto</b>'})
    const editor = wrapper.get('[role=textbox]').element
    const selection = window.getSelection()!
    const range = document.createRange()
    range.selectNodeContents(editor.querySelector('b')!)
    selection.removeAllRanges()
    selection.addRange(range)
    document.dispatchEvent(new Event('selectionchange'))
    selection.removeAllRanges()
    const exec = vi.fn(() => {
      expect(window.getSelection()!.toString()).toBe('Texto')
      return true
    })
    Object.defineProperty(document, 'execCommand', {value: exec, configurable: true})
    ;(wrapper.vm as any).applyFormat('bold')
    expect(exec).toHaveBeenCalledWith('bold', false, undefined)
    delete (document as any).execCommand
  })

  it('associates label/errors with the textbox and uses a hidden input for name', () => {
    const wrapper = setup({name: 'body', label: 'Contenido', errorMessages: ['Obligatorio'], modelValue: '<b>Hola</b>'})
    const editor = wrapper.get('[role=textbox]')
    expect(editor.attributes('name')).toBeUndefined()
    expect(wrapper.get('label').attributes('for')).toBe(editor.attributes('id'))
    expect(editor.attributes('aria-labelledby')).toBe(wrapper.get('label').attributes('id'))
    expect(editor.attributes('aria-invalid')).toBe('true')
    expect(wrapper.get(`#${editor.attributes('aria-describedby')}`).text()).toContain('Obligatorio')
    expect(wrapper.get('input[type=hidden]').attributes('name')).toBe('body')
    expect((wrapper.get('input[type=hidden]').element as HTMLInputElement).value).toBe('<b>Hola</b>')
  })

  it('registers real rules with VForm and validates edits through v-model', async () => {
    const model = ref<string | null>('')
    const rule = vi.fn((value: string) => !!value || 'Obligatorio')
    const Parent = defineComponent({
      setup: () => () => h(VForm, {}, {default: () => h(HtmlEditor, {
        name: 'body', modelValue: model.value, rules: [rule],
        'onUpdate:modelValue': (value: string) => { model.value = value },
      })}),
    })
    const wrapper = mount(Parent, {global: {plugins: [createVuetify()]}})
    wrappers.push(wrapper)
    await flushPromises()
    expect((await wrapper.getComponent(VForm).vm.validate()).valid).toBe(false)
    const editor = wrapper.get('[role=textbox]')
    editor.element.innerHTML = '<b>Completo</b>'
    await editor.trigger('input')
    await flushPromises()
    expect(model.value).toBe('<b>Completo</b>')
    expect(wrapper.getComponent(VInput).props('modelValue')).toBe('<b>Completo</b>')
    expect((await wrapper.getComponent(VForm).vm.validate()).valid).toBe(true)
    expect(rule).toHaveBeenCalledWith('<b>Completo</b>')
    wrapper.getComponent(VForm).vm.reset()
    await flushPromises()
    expect(model.value).toBe('')
    expect(editor.element.innerHTML).toBe('')
  })

  it('inherits readonly from VForm, including exposed methods', async () => {
    const Parent = defineComponent({
      setup: () => () => h(VForm, {readonly: true}, {
        default: () => h(HtmlEditor, {modelValue: 'Original'}),
      }),
    })
    const wrapper = mount(Parent, {global: {plugins: [createVuetify()]}})
    wrappers.push(wrapper)
    await nextTick()
    const child = wrapper.getComponent(HtmlEditor)
    ;(child.vm as any).clear()
    expect(wrapper.get('[role=textbox]').attributes('contenteditable')).toBe('false')
    expect(child.emitted('update:modelValue')).toBeUndefined()
  })

  it('removes the selectionchange listener on unmount', () => {
    const add = vi.spyOn(document, 'addEventListener')
    const remove = vi.spyOn(document, 'removeEventListener')
    const wrapper = setup()
    const listener = add.mock.calls.find(([name]) => name === 'selectionchange')?.[1]
    wrapper.unmount()
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    expect(listener).toBeDefined()
    expect(remove).toHaveBeenCalledWith('selectionchange', listener)
  })
})
