import {beforeEach, describe, expect, it, vi} from 'vitest'
import {defineComponent} from 'vue'
import {flushPromises, mount} from '@vue/test-utils'
import IdentityRegistration from '../src/components/IdentityRegistration/IdentityRegistration.vue'
import IdentityVerificationResend from '../src/components/IdentityVerificationResend/IdentityVerificationResend.vue'
import {ClientError} from '@drax/common-front'

const {register, registrationOptions, resendVerificationEmail} = vi.hoisted(() => ({register: vi.fn(), registrationOptions: vi.fn(), resendVerificationEmail: vi.fn()}))
vi.mock('../src/composables/useAuth.js', () => ({useAuth: () => ({register, registrationOptions, resendVerificationEmail})}))
vi.mock('@drax/common-vue', () => ({useI18nValidation: () => ({$ta: (value: unknown) => value})}))
vi.mock('vue-i18n', () => ({useI18n: () => ({t: (key: string) => key, te: () => false})}))
vi.mock('vue-router', () => ({useRouter: () => ({push: vi.fn()})}))

const container = {template: '<div><slot /></div>'}
const Form = defineComponent({
    setup(_, {expose}) { expose({validate: async () => ({valid: true})}) },
    template: '<form><slot /></form>'
})
const Field = defineComponent({
    props: ['modelValue', 'label', 'errorMessages', 'rules'], emits: ['update:modelValue'],
    template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
})
const Button = defineComponent({
    props: ['disabled', 'loading'],
    template: '<button :disabled="disabled"><slot /></button>'
})
function render() {
    return mount(IdentityRegistration, {global: {stubs: {
        VSheet: container, VCard: container, VCardText: container, VCardTitle: {template: '<h2><slot /></h2>'},
        VCardActions: container, VAlert: {props: ['type'], template: '<div :data-alert-type="type"><slot /></div>'}, VSpacer: true,
        VForm: Form, VTextField: Field, VBtn: Button
    }}})
}

beforeEach(() => {
    vi.resetAllMocks()
    register.mockResolvedValue({success: true})
    resendVerificationEmail.mockResolvedValue({success: true, message: 'neutral'})
})

const registrationInputs = {
    '#name-input': 'Pending User',
    '#username-input': 'pending-user',
    '#email-input': 'pending@example.test',
    '#phone-input': '123456789',
    '#new-password-input': 'secret-password',
    '#confirm-password-input': 'secret-password',
    '#tenant-name-input': 'Organization',
}

async function fillRegistration(wrapper: ReturnType<typeof render>) {
    for (const [selector, value] of Object.entries(registrationInputs)) {
        await wrapper.get(selector).setValue(value)
    }
}

function expectRegistrationInputs(wrapper: ReturnType<typeof render>) {
    for (const [selector, value] of Object.entries(registrationInputs)) {
        expect(wrapper.get<HTMLInputElement>(selector).element.value).toBe(value)
    }
}

function button(wrapper: ReturnType<typeof render>, label: string) {
    const matches = wrapper.findAll('button').filter(node => node.text() === label)
    expect(matches).toHaveLength(1)
    return matches[0]
}

function expectResendOnly(wrapper: ReturnType<typeof render>) {
    const resend = wrapper.getComponent(IdentityVerificationResend)
    expect(resend.props('email')).toBe('pending@example.test')
    expect(resend.props('backLabel')).toBe('auth.backToRegistration')
    expect(wrapper.findAll('form')).toHaveLength(1)
    expect(wrapper.find('form form').exists()).toBe(false)
    expect(wrapper.find('#email-input').exists()).toBe(false)
    expect(wrapper.find('#tenant-name-input').exists()).toBe(false)
    expect(wrapper.findAll('h2').map(title => title.text())).toEqual(['auth.verificationFormTitle'])
    expect(wrapper.text()).not.toContain('auth.verificationResendTitle')
    expect(wrapper.text()).not.toContain('auth.registrationVerificationPending')
    expect(wrapper.text()).not.toContain('user.events.registrationComplete')
    expect(button(wrapper, 'auth.backToRegistration').attributes('type')).toBe('button')
    expect(wrapper.findAll('button[type="submit"]')).toHaveLength(1)
    return resend
}

describe('verification after registration', () => {
    it('replaces the unsubmitted form and restores all inputs and tenant on back', async () => {
        registrationOptions.mockResolvedValue({tenantRequired: true})
        const wrapper = render()
        await flushPromises()
        await fillRegistration(wrapper)
        expect(button(wrapper, 'auth.verificationResendTitle').attributes('type')).toBe('button')
        expect(button(wrapper, 'auth.verificationResendTitle').element.parentElement?.classList.contains('mt-2')).toBe(true)
        await button(wrapper, 'auth.verificationResendTitle').trigger('click')
        const resend = expectResendOnly(wrapper)
        await resend.get('input[type="email"]').setValue('other@example.test')
        await button(wrapper, 'auth.backToRegistration').trigger('click')
        expect(wrapper.findComponent(IdentityVerificationResend).exists()).toBe(false)
        expect(wrapper.findAll('form')).toHaveLength(1)
        expect(wrapper.findAll('h2').map(title => title.text())).toEqual(['user.action.register'])
        expectRegistrationInputs(wrapper)
        expect(register).not.toHaveBeenCalled()
        expect(resendVerificationEmail).not.toHaveBeenCalled()
        expect(registrationOptions).toHaveBeenCalledTimes(1)
        await button(wrapper, 'auth.verificationResendTitle').trigger('click')
        expectResendOnly(wrapper)
    })

    it.each([false, true, undefined])('replaces and restores the result with prefilled resend (verificationEmailSent=%s)', async verificationEmailSent => {
        registrationOptions.mockResolvedValue({tenantRequired: true})
        register.mockResolvedValue({success: true, message: 'User registered successfully.',
            ...(verificationEmailSent === undefined ? {} : {verificationEmailSent})})
        const wrapper = render()
        await flushPromises()
        await fillRegistration(wrapper)
        await wrapper.get('form').trigger('submit')
        await flushPromises()
        const alertType = verificationEmailSent === false ? 'warning' : 'success'
        const message = verificationEmailSent === false ? 'auth.registrationVerificationPending' : 'user.events.registrationComplete'
        const otherMessage = verificationEmailSent === false ? 'user.events.registrationComplete' : 'auth.registrationVerificationPending'
        expect(wrapper.get('[data-alert-type]').attributes('data-alert-type')).toBe(alertType)
        expect(wrapper.text()).toContain(message)
        expect(wrapper.text()).not.toContain(otherMessage)
        await button(wrapper, 'auth.verificationResendTitle').trigger('click')
        const resend = expectResendOnly(wrapper)
        expect(wrapper.find('[data-alert-type]').exists()).toBe(false)
        await wrapper.get('form').trigger('submit')
        await flushPromises()
        expect(resendVerificationEmail).toHaveBeenCalledWith('pending@example.test')
        expect(register).toHaveBeenCalledTimes(1)
        expect(wrapper.text()).toContain('auth.verificationResendNeutral')
        await resend.get('input[type="email"]').setValue('other@example.test')
        await button(wrapper, 'auth.backToRegistration').trigger('click')
        expect(wrapper.findComponent(IdentityVerificationResend).exists()).toBe(false)
        expect(wrapper.find('form').exists()).toBe(false)
        expect(wrapper.get('[data-alert-type]').attributes('data-alert-type')).toBe(alertType)
        expect(wrapper.text()).toContain(message)
        expect(wrapper.text()).not.toContain(otherMessage)
        expect(wrapper.text()).not.toContain('auth.verificationResendNeutral')
        expect(wrapper.find('#email-input').exists()).toBe(false)
        await button(wrapper, 'auth.verificationResendTitle').trigger('click')
        expectResendOnly(wrapper)
        expect(register).toHaveBeenCalledTimes(1)
        expect(registrationOptions).toHaveBeenCalledTimes(1)
    })

    it.each([
        new Error('offline'),
        new ClientError({body: {inputErrors: [{field: 'email', reason: 'validation.unique'}]}} as any),
    ])('replaces failed/duplicate registration with one resend form and restores inputs and errors (%s)', async error => {
        registrationOptions.mockResolvedValue({tenantRequired: true})
        register.mockRejectedValue(error)
        const wrapper = render()
        await flushPromises()
        await fillRegistration(wrapper)
        await wrapper.get('form').trigger('submit')
        await flushPromises()
        const previousErrors = wrapper.findAll('[data-alert-type="error"]').map(alert => alert.text())
        const previousEmailErrors = wrapper.findAllComponents(Field).find(field => field.attributes('id') === 'email-input')!.props('errorMessages')
        await button(wrapper, 'auth.verificationResendTitle').trigger('click')
        const resend = expectResendOnly(wrapper)
        expect(wrapper.find('[data-alert-type="error"]').exists()).toBe(false)
        await wrapper.get('form').trigger('submit')
        await flushPromises()
        expect(resendVerificationEmail).toHaveBeenCalledWith('pending@example.test')
        expect(register).toHaveBeenCalledTimes(1)
        await resend.get('input[type="email"]').setValue('other@example.test')
        await button(wrapper, 'auth.backToRegistration').trigger('click')
        expect(wrapper.findComponent(IdentityVerificationResend).exists()).toBe(false)
        expect(wrapper.findAll('form')).toHaveLength(1)
        expectRegistrationInputs(wrapper)
        expect(wrapper.findAll('[data-alert-type="error"]').map(alert => alert.text())).toEqual(previousErrors)
        expect(wrapper.findAllComponents(Field).find(field => field.attributes('id') === 'email-input')!.props('errorMessages')).toEqual(previousEmailErrors)
        button(wrapper, 'auth.verificationResendTitle')
        expect(registrationOptions).toHaveBeenCalledTimes(1)
    })
})

describe('runtime registration options', () => {
    it('blocks submission while loading and sends tenantName only when required', async () => {
        let resolve!: (value: {tenantRequired: boolean}) => void
        registrationOptions.mockReturnValue(new Promise(r => {resolve = r}))
        const wrapper = render()
        await wrapper.get('form').trigger('submit')
        expect(register).not.toHaveBeenCalled()
        expect(wrapper.find('#tenant-name-input').exists()).toBe(false)
        resolve({tenantRequired: true})
        await flushPromises()
        await wrapper.get('form').trigger('submit')
        expect(register).not.toHaveBeenCalled()
        await wrapper.get('#tenant-name-input').setValue('  Organization  ')
        await wrapper.get('form').trigger('submit')
        await flushPromises()
        expect(register).toHaveBeenCalledWith(expect.objectContaining({tenantName: 'Organization'}))
    })

    it('hides and omits tenantName when disabled', async () => {
        registrationOptions.mockResolvedValue({tenantRequired: false})
        const wrapper = render()
        await flushPromises()
        expect(wrapper.find('#tenant-name-input').exists()).toBe(false)
        await wrapper.get('form').trigger('submit')
        await flushPromises()
        expect(register).toHaveBeenCalledTimes(1)
        expect(register.mock.calls[0][0]).not.toHaveProperty('tenantName')
    })

    it.each([new Error('offline'), {}])('blocks failed or malformed options and allows retry (%s)', async (result) => {
        if (result instanceof Error) registrationOptions.mockRejectedValueOnce(result)
        else registrationOptions.mockResolvedValueOnce(result)
        registrationOptions.mockResolvedValueOnce({tenantRequired: false})
        const wrapper = render()
        await flushPromises()
        expect(wrapper.text()).toContain('auth.registrationOptionsError')
        await wrapper.get('form').trigger('submit')
        expect(register).not.toHaveBeenCalled()
        const retry = wrapper.findAll('button').find(b => b.text() === 'auth.registrationOptionsRetry')!
        await retry.trigger('click')
        await flushPromises()
        await wrapper.get('form').trigger('submit')
        await flushPromises()
        expect(register).toHaveBeenCalledTimes(1)
    })

    it('displays backend registration errors', async () => {
        registrationOptions.mockResolvedValue({tenantRequired: true})
        register.mockRejectedValue(new Error('Tenant already exists'))
        const wrapper = render()
        await flushPromises()
        await wrapper.get('#tenant-name-input').setValue('Organization')
        await wrapper.get('form').trigger('submit')
        await flushPromises()
        expect(wrapper.text()).toContain('Tenant already exists')
    })
})
