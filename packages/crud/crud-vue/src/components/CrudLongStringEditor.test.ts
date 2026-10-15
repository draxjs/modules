import {defineComponent} from 'vue'
import {shallowMount} from '@vue/test-utils'
import {describe, expect, it, vi} from 'vitest'
import CrudFormField from './CrudFormField.vue'
import HtmlEditor from './HtmlEditor.vue'
import MarkdownEditor from './MarkdownEditor.vue'

vi.mock('vue-i18n', () => ({useI18n: () => ({t: (key: string) => key, te: () => false})}))
vi.mock('@drax/identity-vue', () => ({useAuth: () => ({hasPermission: () => true})}))
vi.mock('../stores/UseCrudStore', () => ({useCrudStore: () => ({getFieldInputErrors: () => []})}))
vi.mock('vuetify/labs/VDateInput', () => ({VDateInput: defineComponent({render: () => null})}))

function setup(editor?: 'html' | 'markdown', options: Record<string, any> = {}) {
  return shallowMount(CrudFormField, {
    props: {
      entity: {name: 'Article'} as any,
      field: {name: 'body', label: 'Body', type: 'longString', default: '', editor},
      modelValue: 'Texto inicial',
      ...options,
    },
    global: {
      stubs: {
        VTextarea: {name: 'VTextarea', props: ['modelValue'], template: '<textarea :value="modelValue" />'},
        VTextField: true, VSelect: true, VCombobox: true, VSwitch: true, VChip: true,
        VCard: true, VCardTitle: true, VCardText: true, VRow: true, VCol: true, VListItem: true,
      },
    },
  })
}

describe('longString editor configuration', () => {
  it('keeps the regular textarea when no editor is configured', () => {
    const wrapper = setup()
    expect(wrapper.find('textarea').element.value).toBe('Texto inicial')
    expect(wrapper.findComponent(HtmlEditor).exists()).toBe(false)
    expect(wrapper.findComponent(MarkdownEditor).exists()).toBe(false)
    wrapper.unmount()
  })

  it.each([['html', HtmlEditor], ['markdown', MarkdownEditor]] as const)(
    'renders the %s editor and forwards validation and presentation props',
    (editor, component) => {
      const rules = [(value: string) => !!value || 'Requerido']
      const wrapper = setup(editor, {rules, errorMessages: ['Error remoto'], readonly: true})
      const input = wrapper.findComponent(component)
      expect(input.exists()).toBe(true)
      expect(wrapper.find('textarea').exists()).toBe(false)
      expect(input.props()).toMatchObject({
        modelValue: 'Texto inicial', label: 'Body', readonly: true,
        rules, errorMessages: ['Error remoto'],
      })
      wrapper.unmount()
    },
  )

  it.each([['html', HtmlEditor], ['markdown', MarkdownEditor]] as const)(
    'propagates %s changes and calls onInput exactly once with the string',
    async (editor, component) => {
      const onInput = vi.fn()
      const wrapper = setup(editor, {onInput})
      wrapper.findComponent(component).vm.$emit('update:modelValue', 'Nuevo contenido')
      await wrapper.vm.$nextTick()
      expect(wrapper.emitted('update:modelValue')).toEqual([['Nuevo contenido']])
      expect(wrapper.emitted('updateValue')).toHaveLength(1)
      expect(onInput).toHaveBeenCalledExactlyOnceWith('Nuevo contenido')
      wrapper.unmount()
    },
  )

  it('does not activate editors for other field types', () => {
    const wrapper = setup('html', {
      field: {name: 'title', label: 'Title', type: 'string', editor: 'html', default: ''},
    })
    expect(wrapper.findComponent(HtmlEditor).exists()).toBe(false)
    expect(wrapper.findComponent(MarkdownEditor).exists()).toBe(false)
    wrapper.unmount()
  })
})
