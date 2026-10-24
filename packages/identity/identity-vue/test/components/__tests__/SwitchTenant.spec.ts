import {beforeEach, describe, expect, it, vi} from 'vitest'
import {mount} from '@vue/test-utils'
import {nextTick} from 'vue'
import SwitchTenant from '../../../src/components/SwitchTenant/SwitchTenant.vue'

const {isAuthenticated, hasPermission, switchTenant} = vi.hoisted(() => ({
  isAuthenticated: vi.fn(), hasPermission: vi.fn(), switchTenant: vi.fn(),
}))
vi.mock('../../../src/composables/useAuth', () => ({
  useAuth: () => ({isAuthenticated, hasPermission, switchTenant}),
}))
vi.mock('../../../src/stores/AuthStore', () => ({
  useAuthStore: () => ({authUser: {tenant: {name: 'Persisted tenant'}, role: {permissions: ['user:switchTenant']}}}),
}))
vi.mock('vue-i18n', () => ({useI18n: () => ({t: (key: string) => key})}))
vi.mock('../../../src/combobox/TenantCombobox.vue', () => ({default: {template: '<div data-test="tenant-selector" />'}}))

function render() {
  return mount(SwitchTenant, {global: {stubs: {
    VToolbar: {template: '<div data-test="toolbar"><slot /></div>'},
    VToolbarTitle: {template: '<div><slot /></div>'},
    VSpacer: true,
    VBtn: {template: '<button><slot /></button>'},
  }}})
}

beforeEach(() => { vi.resetAllMocks() })

describe('SwitchTenant visibility', () => {
  it.each([
    {authenticated: false, permitted: false, visible: false},
    {authenticated: false, permitted: true, visible: false},
    {authenticated: true, permitted: false, visible: false},
    {authenticated: true, permitted: true, visible: true},
  ])('requires valid authentication and permission ($authenticated / $permitted)', ({authenticated, permitted, visible}) => {
    isAuthenticated.mockReturnValue(authenticated)
    hasPermission.mockReturnValue(permitted)
    const wrapper = render()
    expect(wrapper.find('[data-test="toolbar"]').exists()).toBe(visible)
    expect(wrapper.find('[data-test="tenant-selector"]').exists()).toBe(visible)
    if (authenticated) expect(hasPermission).toHaveBeenCalledWith('user:switchTenant')
    expect(switchTenant).not.toHaveBeenCalled()
  })

  it('hides a previously visible selector when authentication is lost despite persisted permissions', async () => {
    isAuthenticated.mockReturnValue(true)
    hasPermission.mockReturnValue(true)
    const wrapper = render()
    expect(wrapper.find('[data-test="toolbar"]').exists()).toBe(true)
    isAuthenticated.mockReturnValue(false)
    wrapper.vm.$forceUpdate()
    await nextTick()
    expect(wrapper.find('[data-test="toolbar"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="tenant-selector"]').exists()).toBe(false)
  })
})
