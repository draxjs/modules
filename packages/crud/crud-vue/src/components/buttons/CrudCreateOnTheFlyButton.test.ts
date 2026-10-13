import {defineComponent, h} from 'vue'
import {mount} from '@vue/test-utils'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {createVuetify} from 'vuetify'
import {VBtn} from 'vuetify/components/VBtn'
import {VIcon} from 'vuetify/components/VIcon'
import type {IEntityCrud} from '@drax/crud-share'
import {configureCrudButtons, resetCrudButtonsConfig} from '../../config/CrudButtonConfig'
import CrudCreateOnTheFlyButton from './CrudCreateOnTheFlyButton.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({t: (key: string) => key}),
}))

vi.mock('../../stores/UseCrudStore', () => ({
  useCrudStore: () => ({$reset: vi.fn()}),
}))

vi.mock('../../composables/UseCrud', () => ({
  useCrud: () => ({onCreate: vi.fn()}),
}))

vi.mock('../CrudForm.vue', () => ({default: defineComponent({render: () => null})}))
vi.mock('../CrudDialog.vue', () => ({default: defineComponent({render: () => null})}))

const TooltipStub = defineComponent({
  setup(_, {slots}) {
    return () => h('div', slots.activator?.({props: {}}))
  },
})

function mountButton(props: {icon?: string; label?: string} = {}) {
  return mount(CrudCreateOnTheFlyButton, {
    props: {entity: {name: 'Country'} as IEntityCrud, ...props},
    global: {
      plugins: [createVuetify()],
      components: {VBtn, VIcon},
      stubs: {VTooltip: TooltipStub},
    },
  })
}

beforeEach(resetCrudButtonsConfig)
afterEach(resetCrudButtonsConfig)

describe('CrudCreateOnTheFlyButton', () => {
  it('renders the default icon without a label', () => {
    const wrapper = mountButton()

    expect(wrapper.find('button .v-icon.mdi-plus').exists()).toBe(true)
    wrapper.unmount()
  })

  it('renders the configured icon without a label', () => {
    configureCrudButtons({buttons: {createOnTheFly: {icon: 'mdi-plus-circle'}}})
    const wrapper = mountButton()

    expect(wrapper.find('button .v-icon.mdi-plus-circle').exists()).toBe(true)
    wrapper.unmount()
  })

  it('renders an explicit icon instead of the configured icon', () => {
    configureCrudButtons({buttons: {createOnTheFly: {icon: 'mdi-plus-circle'}}})
    const wrapper = mountButton({icon: 'mdi-pencil'})

    expect(wrapper.find('button .v-icon.mdi-pencil').exists()).toBe(true)
    wrapper.unmount()
  })

  it('renders the icon alongside the label', () => {
    const wrapper = mountButton({label: 'Crear'})

    expect(wrapper.find('button .v-icon.mdi-plus').exists()).toBe(true)
    expect(wrapper.find('button').text()).toBe('Crear')
    expect(wrapper.find('button').classes()).not.toContain('v-btn--icon')
    wrapper.unmount()
  })
})
