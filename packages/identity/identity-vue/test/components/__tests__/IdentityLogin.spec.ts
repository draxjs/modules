import {beforeEach, describe, it, expect, vi} from 'vitest'
import {mount} from '@vue/test-utils'
import {createI18n} from 'vue-i18n'
import {createVuetify} from 'vuetify'
import IdentityLogin from '../../../src/components/IdentityLogin/IdentityLogin.vue'
import IdentityRememberMe from '../../../src/components/IdentityRememberMe.vue'
import IdentityVerificationResend from '../../../src/components/IdentityVerificationResend/IdentityVerificationResend.vue'
import messages from '../../../../identity-front/src/i18n/identity-auth-i18n'

const {login} = vi.hoisted(() => ({login: vi.fn()}))
vi.mock('../../../src/composables/useAuth.js', () => ({useAuth: () => ({login, isAuthenticated: () => false})}))
vi.mock('@drax/common-vue', () => ({useI18nValidation: () => ({$ta: (value: unknown) => value})}))
vi.mock('../../../src/components/IdentityProfileView/IdentityProfileView.vue', () => ({default: {template: '<div />'}}))

const options = (locale = 'en') => ({
  global: {plugins: [createVuetify(), createI18n({legacy: false, locale, messages: {
    en: {...messages.en, user: {field: {email: 'Email'}}},
    es: {...messages.es, user: {field: {email: 'Correo electrónico'}}},
  }})]},
})

beforeEach(() => {
  vi.stubEnv('VITE_DRAX_REMEMBER_ME_ENABLED', 'true')
  login.mockReset().mockResolvedValue(undefined)

  vi.stubGlobal('ResizeObserver', class {observe() {} unobserve() {} disconnect() {}})
})

describe('IdentityRememberMe', () => {
  it.each([['en', 'Remember my session on this device'], ['es', 'Recordar mi sesión en este dispositivo']])('localizes %s and starts unchecked', (locale, label) => {
    const wrapper = mount(IdentityRememberMe, options(locale))
    expect(wrapper.text()).toContain(label)
    expect(wrapper.get('input[type="checkbox"]').element.checked).toBe(false)
  })

  it('is hidden by default when the feature is not configured', () => {
    vi.stubEnv('VITE_DRAX_REMEMBER_ME_ENABLED', undefined)
    const wrapper = mount(IdentityRememberMe, options())
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(false)
  })
})

describe('IdentityLogin', () => {
  it.each([
    {register: false, recovery: false},
    {register: false, recovery: true},
    {register: true, recovery: false},
    {register: true, recovery: true},
  ])('keeps verification out of login (register=$register, recovery=$recovery)', ({register, recovery}) => {
    const wrapper = mount(IdentityLogin, {...options(), props: {register, recovery}})
    expect(wrapper.text()).not.toContain(messages.en.auth.verificationResendTitle)
    expect(wrapper.findComponent(IdentityVerificationResend).exists()).toBe(false)
    expect(wrapper.findAll('form')).toHaveLength(1)
    expect(wrapper.find('a[href="/registration"]').exists()).toBe(register)
    expect(wrapper.find('a[href="/password/recovery/request"]').exists()).toBe(recovery)
  })
  it('preserves two-argument login unless explicitly checked', async () => {
    const wrapper = mount(IdentityLogin, options())
    await wrapper.get('#username-input').setValue('user')
    await wrapper.get('#password-input').setValue('password')
    await wrapper.get('form').trigger('submit')
    expect(login).toHaveBeenLastCalledWith('user', 'password')
    await wrapper.get('input[type="checkbox"]').setValue(true)
    await wrapper.get('form').trigger('submit')
    expect(login).toHaveBeenLastCalledWith('user', 'password', true)
  })

  it('hides the checkbox when disabled and never sends a third argument', async () => {
    vi.stubEnv('VITE_DRAX_REMEMBER_ME_ENABLED', 'false')
    const wrapper = mount(IdentityLogin, options())
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(false)
    await wrapper.get('#username-input').setValue('user')
    await wrapper.get('#password-input').setValue('password')
    await wrapper.get('form').trigger('submit')
    expect(login).toHaveBeenCalledWith('user', 'password')
  })
})
