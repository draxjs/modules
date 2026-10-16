import {defineComponent, h, ref} from 'vue'
import {useDynamicFilters} from '../composables/UseDynamicFilters'
import {EntityCrud} from '../cruds/EntityCrud'
import {flushPromises, mount} from '@vue/test-utils'
import {describe, expect, it, vi} from 'vitest'
import CrudFormField from './CrudFormField.vue'
import CrudAutocomplete from './CrudAutocomplete.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({t: (key: string) => key, te: () => false}),
}))
vi.mock('@drax/identity-vue', () => ({
  useAuth: () => ({hasPermission: () => true}),
}))
vi.mock('@drax/common-front', () => ({debounce: (fn: Function) => fn}))
vi.mock('../stores/UseCrudStore', () => ({
  useCrudStore: () => ({getFieldInputErrors: () => []}),
}))
vi.mock('vuetify/labs/VDateInput', () => ({VDateInput: defineComponent({render: () => null})}))
vi.mock('./buttons/CrudCreateOnTheFlyButton.vue', () => ({
  default: defineComponent({name: 'CrudCreateOnTheFlyButton', emits: ['created'], render: () => null}),
}))

const SelectStub = defineComponent({
  name: 'Selector',
  props: ['modelValue', 'items', 'itemValue', 'itemTitle', 'multiple', 'chips'],
  emits: ['update:modelValue', 'update:search'],
  setup(props, {slots}) {
    return () => h('div', [
      slots.selection?.({item: {raw: props.modelValue, title: props.modelValue}}),
      slots.append?.(),
    ])
  },
})
const ChipStub = defineComponent({
  setup(_, {slots}) { return () => h('span', slots.default?.()) },
})
const global = {
  stubs: {
    VAutocomplete: SelectStub, VSelect: SelectStub, VChip: ChipStub,
    VTextField: true, VTextarea: true, VCombobox: true, VSwitch: true,
    VCard: true, VCardTitle: true, VCardText: true, VRow: true, VCol: true, VListItem: true,
  },
}

function setupField(config: Record<string, any> = {}, modelValue: any = '', extraProps: Record<string, any> = {}) {
  const provider = {search: vi.fn().mockResolvedValue([{_id: '1', name: 'Activo', code: 'active'}]), findById: vi.fn()}
  const reference = {name: 'Status', provider}
  const getRef = vi.fn().mockReturnValue(reference)
  const wrapper = mount(CrudFormField, {
    props: {
      entity: {name: 'Task', getRef} as any,
      field: {name: 'status', label: 'Status', type: 'refvalue', ref: 'Status', default: '', ...config} as any,
      modelValue,
      ...extraProps,
    },
    global,
  })
  return {wrapper, provider, getRef}
}

describe('array.refvalue fields', () => {
  it.each([false, true])('selects multiple names with noFilter=%s', async noFilter => {
    const {wrapper, provider} = setupField({type: 'array.refvalue', noFilter, default: []}, [])
    await flushPromises()
    const selector = wrapper.findComponent(SelectStub)
    expect(selector.props()).toMatchObject({multiple: true, chips: true, itemValue: 'name', itemTitle: 'name'})
    expect(provider.search).toHaveBeenCalledWith('')
    selector.vm.$emit('update:modelValue', ['Activo', 'Pendiente'])
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['Activo', 'Pendiente']])
    expect(wrapper.emitted('updateValue')).toHaveLength(1)
    wrapper.unmount()
  })

  it('uses custom values independently from labels, and can clear selection', async () => {
    const {wrapper} = setupField({type: 'array.refvalue', refValue: 'code', refDisplay: 'name', default: []}, ['active'])
    await flushPromises()
    const selector = wrapper.findComponent(SelectStub)
    expect(selector.props()).toMatchObject({itemValue: 'code', itemTitle: 'name', modelValue: ['active']})
    selector.vm.$emit('update:modelValue', ['active', 'pending'])
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['active', 'pending']])
    selector.vm.$emit('update:modelValue', [])
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[]])
    wrapper.unmount()
  })

  it('does not resolve saved values as IDs', async () => {
    const {wrapper, provider} = setupField({type: 'array.refvalue', default: []}, ['Archivado'])
    await flushPromises()
    expect(wrapper.findComponent(SelectStub).props('modelValue')).toEqual(['Archivado'])
    expect(provider.findById).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it.each([undefined, 'code'])('appends the configured value on creation without losing or duplicating selections (%s)', async refValue => {
    const {wrapper} = setupField({type: 'array.refvalue', refValue, addOnTheFly: true, default: []}, [refValue ? 'active' : 'Activo'])
    await flushPromises()
    const item = {_id: '2', name: 'Pendiente', code: 'pending'}
    const button = wrapper.findComponent({name: 'CrudCreateOnTheFlyButton'})
    button.vm.$emit('created', item)
    const values = refValue ? ['active', 'pending'] : ['Activo', 'Pendiente']
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([values])
    button.vm.$emit('created', item)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([values])
    expect(wrapper.emitted('updateValue')).toHaveLength(2)
    wrapper.unmount()
  })

  it.each(['array.refvalue', 'array.ref'])('notifies onInput with the new array when creating an option (%s)', async type => {
    const onInput = vi.fn()
    const initial = type === 'array.ref' ? ['1'] : ['Activo']
    const expected = [...initial, type === 'array.ref' ? '2' : 'Pendiente']
    const {wrapper} = setupField({type, addOnTheFly: true, default: []}, initial, {onInput})
    await flushPromises()
    wrapper.findComponent({name: 'CrudCreateOnTheFlyButton'}).vm.$emit('created', {_id: '2', name: 'Pendiente'})
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([expected])
    expect(onInput).toHaveBeenCalledExactlyOnceWith(expected)
    expect(wrapper.emitted('updateValue')).toHaveLength(1)
    wrapper.unmount()
  })

  it('initializes the form as an empty array when no default is provided', () => {
    class TestCrud extends EntityCrud {
      get fields(): any[] { return [{name: 'statuses', type: 'array.refvalue', ref: 'Status', label: 'Statuses'}] }
    }
    expect(new TestCrud().form).toEqual({statuses: []})
  })

  it.each(['eq', 'in', 'nin'])('preserves reference metadata in dynamic %s filters', operator => {
    const field = {name: 'statuses', type: 'array.refvalue', ref: 'Status', refValue: 'code', refDisplay: 'name'}
    const filters = ref<any[]>([{name: 'statuses', operator}])
    const {onUpdateField} = useDynamicFilters(ref('Task'), ref([field]), filters)
    onUpdateField(0)
    expect(filters.value[0]).toMatchObject({type: operator === 'eq' ? 'refvalue' : 'array.refvalue', ref: 'Status', refValue: 'code', refDisplay: 'name'})
  })
})

describe('refvalue fields', () => {
  it('loads options from the referenced entity and stores name by default', async () => {
    const {wrapper, provider, getRef} = setupField()
    await flushPromises()
    const selector = wrapper.findComponent(SelectStub)
    expect(getRef).toHaveBeenCalledWith('Status')
    expect(provider.search).toHaveBeenCalledWith('')
    expect(selector.props('itemValue')).toBe('name')
    expect(selector.props('itemTitle')).toBe('name')
    selector.vm.$emit('update:modelValue', 'Activo')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['Activo'])
    expect(wrapper.emitted('updateValue')).toHaveLength(1)
    wrapper.unmount()
  })

  it('keeps display and stored properties independent', async () => {
    const {wrapper} = setupField({refValue: 'code', refDisplay: 'name', noFilter: true})
    await flushPromises()
    const selector = wrapper.findComponent(SelectStub)
    expect(selector.props('itemValue')).toBe('code')
    expect(selector.props('itemTitle')).toBe('name')
    selector.vm.$emit('update:modelValue', 'active')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['active'])
    wrapper.unmount()
  })

  it('shows a stored value even when it is no longer among the options, without looking it up by ID', async () => {
    const {wrapper, provider} = setupField({}, 'Archivado')
    await flushPromises()
    expect(wrapper.text()).toContain('Archivado')
    expect(provider.findById).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it.each(['name', 'code'])('uses %s for options created on the fly', async (refValue) => {
    const {wrapper} = setupField({refValue, addOnTheFly: true})
    await flushPromises()
    const item = {_id: '2', name: 'Pendiente', code: 'pending'}
    wrapper.findComponent({name: 'CrudCreateOnTheFlyButton'}).vm.$emit('created', item)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([item[refValue as keyof typeof item]])
    expect(wrapper.findComponent(CrudAutocomplete).findComponent(SelectStub).props('items')).toContainEqual(item)
    wrapper.unmount()
  })

  it('keeps ref fields using _id, including creation on the fly', async () => {
    const {wrapper} = setupField({type: 'ref', addOnTheFly: true})
    await flushPromises()
    expect(wrapper.findComponent(SelectStub).props('itemValue')).toBe('_id')
    wrapper.findComponent({name: 'CrudCreateOnTheFlyButton'}).vm.$emit('created', {_id: '2', name: 'Pendiente'})
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['2'])
    wrapper.unmount()
  })
})
