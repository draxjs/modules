import {defineComponent, h, ref} from 'vue'
import {mount} from '@vue/test-utils'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import type {IEntityCrud, IEntityCrudField} from '@drax/crud-share'
import CrudForm from './CrudForm.vue'

const operation = ref('create')
const form = ref<Record<string, any>>({})
const onSubmit = vi.fn(async () => ({status: 'created', item: form.value}))
const validate = vi.fn(async () => ({valid: true, errors: []}))
const getFieldInputErrors = vi.fn<(fieldName: string) => string[]>(() => [])

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key === 'person.sections.BASIC' ? 'Datos básicos' : key,
    te: (key: string) => key === 'person.sections.BASIC',
  }),
}))

vi.mock('@drax/identity-vue', () => ({
  useAuth: () => ({hasPermission: (permission: string) => permission !== 'restricted'}),
}))

vi.mock('../composables/UseCrud', () => ({
  useCrud: () => ({operation, form, error: ref(), onSubmit, onCancel: vi.fn()}),
}))

vi.mock('../stores/UseCrudStore', () => ({
  useCrudStore: () => ({getFieldInputErrors, resetErrors: vi.fn(), loading: false}),
}))

vi.mock('./CrudFormField.vue', () => ({
  default: {
    name: 'CrudFormField',
    props: ['field', 'modelValue', 'readonly', 'variant', 'rules', 'onInput'],
    emits: ['update:modelValue'],
    template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  },
}))

const SlotStub = defineComponent({
  setup(_, {slots}) {
    return () => h('div', slots.default?.())
  },
})

const FormStub = defineComponent({
  setup(_, {slots, expose}) {
    expose({validate})
    return () => h('form', slots.default?.())
  },
})

const global = {
  stubs: {
    VForm: FormStub,
    VCard: SlotStub,
    VCardText: SlotStub,
    VCardTitle: SlotStub,
    VCardSubtitle: SlotStub,
    VCardActions: SlotStub,
    VAlert: SlotStub,
    VTabs: SlotStub,
    VTab: SlotStub,
    VTabsWindow: SlotStub,
    VTabsWindowItem: SlotStub,
    VList: SlotStub,
    VListItem: SlotStub,
    VListItemTitle: SlotStub,
    VRow: SlotStub,
    VCol: SlotStub,
    VSpacer: SlotStub,
    VBtn: SlotStub,
  },
}

function createEntity(fields: IEntityCrudField[]) {
  return {
    name: 'Person', i18nName: 'person', sections: ['BASIC', 'ADDRESS'],
    createFields: fields, updateFields: fields, deleteFields: fields, viewFields: fields,
    getRule: () => [], getOnInput: () => undefined,
    inputVariantCreate: 'outlined', inputVariantEdit: 'outlined',
    inputVariantView: 'solo-filled', inputVariantDelete: 'solo-filled',
  } as unknown as IEntityCrud
}

const fields: IEntityCrudField[] = [
  {name: 'id', type: 'string', label: 'ID', default: ''},
  {name: 'fullname', type: 'string', label: 'Nombre', default: '', groupSection: 'BASIC'},
  {name: 'address', type: 'string', label: 'Dirección', default: '', groupSection: 'ADDRESS', md: 6},
  {name: 'secret', type: 'string', label: 'Secreto', default: '', groupSection: 'BASIC', permission: 'restricted'},
]

beforeEach(() => {
  operation.value = 'create'
  form.value = {id: '123', fullname: 'Ana', address: 'Calle 1'}
  vi.clearAllMocks()
})

describe('CRUD form sections', () => {
  it('renders all cards in configured order with their fields, titles and responsive columns', () => {
    const wrapper = mount(CrudForm, {props: {entity: createEntity(fields)}, global})

    expect(wrapper.findAll('.crud-form__section-card').map(card => card.attributes('id'))).toEqual([
      'crud-form-section-card-BASIC', 'crud-form-section-card-ADDRESS',
    ])
    expect(wrapper.find('#crud-form-section-title-BASIC').text()).toBe('Datos básicos')
    expect(wrapper.find('#crud-form-section-title-ADDRESS').text()).toBe('ADDRESS')
    expect(wrapper.find('#crud-form-section-card-BASIC input').element).toHaveProperty('value', 'Ana')
    expect(wrapper.find('#crud-form-section-card-ADDRESS input').element).toHaveProperty('value', 'Calle 1')
    expect(wrapper.find('#crud-form-section-field-column-ADDRESS-address').attributes('md')).toBe('6')
    expect(wrapper.findAll('.crud-form__general-field')).toHaveLength(1)
    expect(wrapper.findAll('input')).toHaveLength(3)
    expect(wrapper.find('#crud-form-tabs').exists()).toBe(false)
    expect(wrapper.find('#crud-form-menu-layout').exists()).toBe(false)
    wrapper.unmount()
  })

  it.each(['create', 'edit', 'view', 'delete'])('uses the %s fields and readonly state', (activeOperation) => {
    operation.value = activeOperation
    const entity = createEntity(fields)
    entity.createFields = [fields[1]]
    entity.updateFields = [fields[2]]
    entity.viewFields = [fields[1]]
    entity.deleteFields = [fields[2]]
    const wrapper = mount(CrudForm, {props: {entity}, global})
    const renderedFields = wrapper.findAllComponents({name: 'CrudFormField'})

    expect(renderedFields).toHaveLength(1)
    expect(renderedFields[0].props('field').name).toBe(['create', 'view'].includes(activeOperation) ? 'fullname' : 'address')
    expect(Boolean(renderedFields[0].props('readonly'))).toBe(['view', 'delete'].includes(activeOperation))
    wrapper.unmount()
  })

  it('updates section values through inputs and custom field slots', async () => {
    const entity = createEntity([
      ...fields,
      {name: 'age', type: 'number', label: 'Edad', default: null, groupSection: 'BASIC'},
    ])
    const wrapper = mount(CrudForm, {
      props: {entity}, global,
      slots: {
        'field.age': (props: any) => h('button', {
          class: 'age-slot', onClick: () => props.setValue('42'),
        }, props.field.label),
      },
    })

    await wrapper.find('#crud-form-section-field-BASIC-fullname').setValue('María')
    await wrapper.find('.age-slot').trigger('click')

    expect(form.value.fullname).toBe('María')
    expect(form.value.age).toBe(42)
    wrapper.unmount()
  })

  it('marks section titles with backend errors', () => {
    getFieldInputErrors.mockImplementation(fieldName => fieldName === 'address' ? ['Invalid address'] : [])
    const wrapper = mount(CrudForm, {props: {entity: createEntity(fields)}, global})

    expect(wrapper.find('#crud-form-section-title-BASIC').classes()).not.toContain('text-red')
    expect(wrapper.find('#crud-form-section-title-ADDRESS').classes()).toContain('text-red')
    wrapper.unmount()
  })

  it('validates and submits the values of all sections together', async () => {
    const wrapper = mount(CrudForm, {props: {entity: createEntity(fields)}, global})

    await wrapper.find('#crud-form-submit-button').trigger('click')

    expect(validate).toHaveBeenCalledOnce()
    expect(onSubmit).toHaveBeenCalledWith(form.value)
    expect(wrapper.emitted('created')).toEqual([[form.value]])
    wrapper.unmount()
  })
})
