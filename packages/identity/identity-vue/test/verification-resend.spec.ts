import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {flushPromises, mount} from '@vue/test-utils'
import {createI18n} from 'vue-i18n'
import {createVuetify} from 'vuetify'
import {VBtn} from 'vuetify/components'
import {ClientError} from '@drax/common-front'
import messages from '../../identity-front/src/i18n/identity-auth-i18n'
import IdentityVerificationResend from '../src/components/IdentityVerificationResend/IdentityVerificationResend.vue'

const {resendVerificationEmail} = vi.hoisted(() => ({resendVerificationEmail: vi.fn()}))
vi.mock('../src/composables/useAuth.js', () => ({useAuth: () => ({resendVerificationEmail})}))
vi.mock('@drax/common-vue', () => ({useI18nValidation: () => ({$ta: (value: unknown) => value})}))

function render(email?: string, locale = 'en', backLabel?: string) {
    return mount(IdentityVerificationResend, {props: {email, backLabel}, global: {
        plugins: [createVuetify(), createI18n({legacy: false, locale, messages: {
            en: {...messages.en, user: {field: {email: 'Email'}}},
            es: {...messages.es, user: {field: {email: 'Correo electrónico'}}},
        }})],
    }})
}
const neutral = {success: true, message: 'If an account is pending verification, activation instructions will be sent.'}

beforeEach(() => {
    resendVerificationEmail.mockReset().mockResolvedValue(neutral)
    vi.stubGlobal('ResizeObserver', class {observe() {} unobserve() {} disconnect() {}})
})
afterEach(() => vi.unstubAllGlobals())

describe('IdentityVerificationResend', () => {
    it.each([
        ['en', 'Account verification'],
        ['es', 'Verificación de cuenta'],
    ] as const)('has one localized form title and only a submit button standalone (%s)', (locale, title) => {
        const wrapper = render(undefined, locale)
        expect(wrapper.findAll('form')).toHaveLength(1)
        expect(wrapper.findAll('.v-card-title').map(node => node.text())).toEqual([title])
        expect(wrapper.text()).not.toContain(messages[locale].auth.verificationResendTitle)
        expect(wrapper.findAll('button')).toHaveLength(1)
        const submit = wrapper.get('button[type="submit"]')
        expect(submit.text()).toBe(messages[locale].auth.verificationResend)
        expect(submit.element.previousElementSibling?.classList.contains('v-spacer')).toBe(true)
        expect(wrapper.emitted('back')).toBeUndefined()
    })

    it.each(['en', 'es'] as const)('optionally emits back without submitting and keeps submit aligned right (%s)', async locale => {
        const copy = messages[locale].auth
        const wrapper = render('pending@example.test', locale, copy.backToLogin)
        expect(wrapper.findAll('form')).toHaveLength(1)
        expect(wrapper.findAll('.v-card-title').map(node => node.text())).toEqual([copy.verificationFormTitle])
        expect(wrapper.findAll('button')).toHaveLength(2)
        const back = wrapper.get('button[type="button"]')
        expect(back.text()).toBe(copy.backToLogin)
        const submit = wrapper.get('button[type="submit"]')
        expect(submit.element.previousElementSibling?.classList.contains('v-spacer')).toBe(true)
        await back.trigger('click')
        expect(wrapper.emitted('back')).toEqual([[]])
        expect(resendVerificationEmail).not.toHaveBeenCalled()
        await wrapper.setProps({backLabel: ''})
        expect(wrapper.findAll('button')).toHaveLength(1)
        expect(wrapper.find('button[type="button"]').exists()).toBe(false)
    })

    it('disables back while loading and restores it after the request', async () => {
        let resolve!: (value: typeof neutral) => void
        resendVerificationEmail.mockReturnValue(new Promise(r => {resolve = r}))
        const wrapper = render('pending@example.test', 'en', 'Back')
        await wrapper.get('form').trigger('submit')
        const back = wrapper.get<HTMLButtonElement>('button[type="button"]')
        expect(back.element.disabled).toBe(true)
        expect(wrapper.get<HTMLButtonElement>('button[type="submit"]').element.disabled).toBe(true)
        await back.trigger('click')
        expect(wrapper.emitted('back')).toBeUndefined()
        resolve(neutral)
        await flushPromises()
        expect(back.element.disabled).toBe(false)
        await back.trigger('click')
        expect(wrapper.emitted('back')).toEqual([[]])
        expect(resendVerificationEmail).toHaveBeenCalledTimes(1)
    })

    it.each(['en', 'es'])('uses neutral localized success copy (%s), not an assertion of delivery', async locale => {
        const wrapper = render('pending@example.test', locale)
        await wrapper.get('form').trigger('submit')
        await flushPromises()
        expect(resendVerificationEmail).toHaveBeenCalledWith('pending@example.test')
        const copy = messages[locale as 'en' | 'es'].auth
        expect(wrapper.get('[role="status"]').text()).toBe(copy.verificationResendNeutral)
        expect(wrapper.text()).toContain(copy.verificationResend)
    })

    it('supports empty and updated prefills and trims the email', async () => {
        const wrapper = render()
        expect(wrapper.get('input[type="email"]').element.value).toBe('')
        await wrapper.setProps({email: 'pending@example.test'})
        expect(wrapper.get('input[type="email"]').element.value).toBe('pending@example.test')
        await wrapper.get('input').setValue('  changed@example.test  ')
        await wrapper.get('form').trigger('submit')
        await flushPromises()
        expect(resendVerificationEmail).toHaveBeenCalledWith('changed@example.test')
    })

    it.each(['', 'username', 'invalid@', 'a b@example.test'])('validates email locally (%s)', async email => {
        const wrapper = render(email)
        await wrapper.get('form').trigger('submit')
        await flushPromises()
        expect(resendVerificationEmail).not.toHaveBeenCalled()
        expect(wrapper.find('.v-messages__message').exists()).toBe(true)
    })

    it('shows a loader, disables inputs and prevents concurrent submits', async () => {
        let resolve!: (value: typeof neutral) => void
        resendVerificationEmail.mockReturnValue(new Promise(r => {resolve = r}))
        const wrapper = render('pending@example.test')
        await wrapper.get('form').trigger('submit')
        expect(wrapper.getComponent(VBtn).props('loading')).toBe(true)
        expect(wrapper.get('button').element.disabled).toBe(true)
        expect(wrapper.get('input').element.disabled).toBe(true)
        await wrapper.get('form').trigger('submit')
        expect(resendVerificationEmail).toHaveBeenCalledTimes(1)
        resolve(neutral)
        await flushPromises()
        expect(wrapper.getComponent(VBtn).props('loading')).toBe(false)
        expect(wrapper.get('button').element.disabled).toBe(false)
        expect(wrapper.text()).toContain(messages.en.auth.verificationResendNeutral)
    })

    it.each([new Error('offline'), new Error('auth.verificationResendError'), null])('shows request errors and allows retry (%s)', async error => {
        resendVerificationEmail.mockRejectedValueOnce(error)
        const wrapper = render('pending@example.test')
        await wrapper.get('form').trigger('submit')
        await flushPromises()
        expect(wrapper.get('.v-alert[role="alert"]').text()).toBe(error?.message === 'offline' ? 'offline' : messages.en.auth.verificationResendError)
        expect(wrapper.find('[role="status"]').exists()).toBe(false)
        expect(wrapper.get('button').element.disabled).toBe(false)
        await wrapper.get('form').trigger('submit')
        await flushPromises()
        expect(wrapper.find('.v-alert[role="alert"]').exists()).toBe(false)
        expect(wrapper.find('[role="status"]').exists()).toBe(true)
    })

    it('shows ClientError email validation and clears stale messages after editing', async () => {
        resendVerificationEmail.mockRejectedValueOnce(new ClientError({body: {
            inputErrors: [{field: 'email', reason: 'validation.email'}],
        }} as any))
        const wrapper = render('pending@example.test')
        await wrapper.get('form').trigger('submit')
        await flushPromises()
        expect(wrapper.text()).toContain('validation.email')
        expect(wrapper.find('[role="status"]').exists()).toBe(false)
        await wrapper.get('input').setValue('other@example.test')
        await flushPromises()
        expect(wrapper.text()).not.toContain('validation.email')
        expect(wrapper.find('.v-alert[role="alert"]').exists()).toBe(false)
    })

    it('does not display a delivery claim from the server response', async () => {
        resendVerificationEmail.mockResolvedValue({...neutral, message: 'Email sent to an existing account!'})
        const wrapper = render('pending@example.test')
        await wrapper.get('form').trigger('submit')
        await flushPromises()
        expect(wrapper.text()).not.toContain('Email sent')
        expect(wrapper.get('[role="status"]').text()).toBe(messages.en.auth.verificationResendNeutral)
    })
})
