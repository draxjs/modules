<script setup lang="ts">
import {ref, watch} from 'vue'
import {ClientError} from '@drax/common-front'
import type {IClientInputError} from '@drax/common-front'
import {useI18nValidation} from '@drax/common-vue'
import {useI18n} from 'vue-i18n'
import {useAuth} from '../../composables/useAuth.js'

const props = withDefaults(defineProps<{email?: string, backLabel?: string}>(), {email: ''})
const emit = defineEmits<{back: []}>()
const {t, te} = useI18n()
const {$ta} = useI18nValidation()
const {resendVerificationEmail} = useAuth()
const email = ref(props.email)
const loading = ref(false)
const success = ref(false)
const errorMsg = ref('')
const inputErrors = ref<IClientInputError>()

watch(() => props.email, value => { email.value = value })
watch(email, () => {
  success.value = false
  errorMsg.value = ''
  inputErrors.value = undefined
})

async function submitResend() {
  if (loading.value) return
  success.value = false
  errorMsg.value = ''
  inputErrors.value = undefined
  const address = email.value.trim()
  if (!address || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
    inputErrors.value = {email: [address ? 'auth.verificationEmailInvalid' : 'validation.required']}
    return
  }
  loading.value = true
  try {
    const result = await resendVerificationEmail(address)
    if (!result.success) throw new Error('auth.verificationResendError')
    // A neutral response does not confirm an account exists or that mail was sent.
    success.value = true
  } catch (error) {
    if (error instanceof ClientError) inputErrors.value = error.inputErrors
    errorMsg.value = error instanceof Error ? error.message : 'auth.verificationResendError'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-form @submit.prevent="submitResend" novalidate>
    <v-card variant="flat">
      <v-card-title>{{ t('auth.verificationFormTitle') }}</v-card-title>
      <v-card-text>
        <v-alert v-if="success" type="success" role="status" class="mb-4">
          {{ t('auth.verificationResendNeutral') }}
        </v-alert>
        <v-alert v-if="errorMsg" type="error" role="alert" class="mb-4">
          {{ te(errorMsg) ? t(errorMsg) : errorMsg }}
        </v-alert>
        <v-text-field
            v-model="email"
            name="verification-email"
            type="email"
            autocomplete="email"
            :label="t('user.field.email')"
            prepend-inner-icon="mdi-email"
            variant="outlined"
            required
            :disabled="loading"
            :error-messages="$ta(inputErrors?.email)"
        />
      </v-card-text>
      <v-card-actions>
        <v-btn v-if="backLabel" type="button" variant="text" :disabled="loading" @click="emit('back')">
          {{ backLabel }}
        </v-btn>
        <v-spacer />
        <v-btn type="submit" color="primary" variant="tonal" :loading="loading" :disabled="loading">
          {{ t('auth.verificationResend') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>
