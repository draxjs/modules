import {defineComponent, h, ref} from 'vue'
import {mount} from '@vue/test-utils'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import CrudFormField from './CrudFormField.vue'
import CrudFormList from './CrudFormList.vue'

const clearFieldInputErrors = vi.fn()

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    te: () => false,
  }),
}))

vi.mock('@drax/identity-vue', () => ({
  useAuth: () => ({
    hasPermission: () => true,
  }),
}))

vi.mock('vuetify', () => ({
  useDisplay: () => ({
    xs: ref(false),
  }),
}))

vi.mock('vuetify/labs/VDateInput', () => ({
  VDateInput: {name: 'VDateInput', render: () => null},
}))

vi.mock('../stores/UseCrudStore', () => ({
  useCrudStore: () => ({
    clearFieldInputErrors,
    getFieldInputErrors: () => [],
    hasFieldListInputErrors: () => false,
    removeArrayItemInputErrors: vi.fn(),
    reorderArrayItemInputErrors: vi.fn(),
  }),
}))

const SlotStub = defineComponent({
  setup(_, {slots}) {
    return () => h('div', slots.default?.())
  },
})

const global = {
  stubs: {
    VBtn: SlotStub,
    VCard: SlotStub,
    VCardText: SlotStub,
    VCardTitle: SlotStub,
    VChip: SlotStub,
    VChipGroup: SlotStub,
    VCol: SlotStub,
    VCombobox: SlotStub,
    VExpansionPanel: SlotStub,
    VExpansionPanelText: SlotStub,
    VExpansionPanelTitle: SlotStub,
    VExpansionPanels: SlotStub,
    VIcon: SlotStub,
    VList: SlotStub,
    VListItem: SlotStub,
    VListItemTitle: SlotStub,
    VRow: SlotStub,
    VSelect: SlotStub,
    VSwitch: SlotStub,
    VTextField: SlotStub,
    VTextarea: SlotStub,
  },
}

const entity = {
  name: 'Task',
} as any

beforeEach(() => {
  clearFieldInputErrors.mockClear()
})

describe('nested CRUD field slots', () => {
  it('exposes an object child with its containing object and consistent value helpers', async () => {
    const task = {type: 'initial'}
    let slotProps: any

    const wrapper = mount(CrudFormField, {
      props: {
        entity,
        field: {
          name: 'task',
          type: 'object',
          label: 'Task',
          objectFields: [
            {name: 'type', type: 'string', label: 'Type', default: ''},
          ],
        } as any,
        modelValue: task,
      },
      slots: {
        'field.task.type': (props: any) => {
          slotProps = props
          return h('button', {class: 'object-slot', onClick: () => props.setValue('updated')}, props.modelValue)
        },
      },
      global,
    })

    expect(wrapper.find('.object-slot').text()).toBe('initial')
    expect(slotProps.form).toStrictEqual(task)
    expect(slotProps.field.name).toBe('type')
    expect(slotProps.parentField.name).toBe('task')
    expect(slotProps.fieldPath).toBe('task.type')

    await wrapper.find('.object-slot').trigger('click')

    expect(task.type).toBe('updated')
    expect(wrapper.emitted('updateValue')).toHaveLength(1)
  })

  it('exposes each array.object child with its item and current index', async () => {
    const tasks = [
      {type: 'first'},
      {type: 'second'},
    ]
    const receivedProps: any[] = []

    const wrapper = mount(CrudFormList, {
      props: {
        entity,
        field: {
          name: 'tasks',
          type: 'array.object',
          label: 'Tasks',
          arrayObjectUI: 'accordion',
          objectFields: [
            {name: 'type', type: 'string', label: 'Type', default: ''},
          ],
        } as any,
        modelValue: tasks,
      },
      slots: {
        'field.tasks.type': (props: any) => {
          receivedProps[props.index] = props
          return h('button', {
            class: `array-slot-${props.index}`,
            onClick: () => props.setValue(`updated-${props.index}`),
          }, props.modelValue)
        },
      },
      global,
    })

    expect(wrapper.find('.array-slot-0').text()).toBe('first')
    expect(wrapper.find('.array-slot-1').text()).toBe('second')
    expect(receivedProps[0].form).toStrictEqual(tasks[0])
    expect(receivedProps[1].form).toStrictEqual(tasks[1])
    expect(receivedProps[0].fieldPath).toBe('tasks.type')

    await wrapper.find('.array-slot-1').trigger('click')

    expect(tasks[1].type).toBe('updated-1')
    expect(wrapper.emitted('updateValue')).toHaveLength(1)
  })
})
