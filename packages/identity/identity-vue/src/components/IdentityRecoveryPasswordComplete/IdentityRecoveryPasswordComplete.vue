<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useAuth } from "../../composables/useAuth.js";
import { ClientError } from "@drax/common-front";
import type { IClientInputError } from "@drax/common-front";
import { useI18nValidation } from "@drax/common-vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router"
import { usePasswordValidation } from "../../composables/usePasswordValidation";

const { t, te } = useI18n()
const { $ta } = useI18nValidation()

const { passwordRulesState, passwordComplexityRule } = usePasswordValidation()

const route = useRoute()
const router = useRouter()

const { recoveryPasswordComplete } = useAuth()

const recoveryCode = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const inputErrors = ref<IClientInputError | undefined>({ currentPassword: [], newPassword: [], confirmPassword: [] })
const errorMsg = ref('')
const loading = ref(false)
const success = ref(false)

let newPasswordVisibility = ref(false)

const isFormValid = computed(() => {
  if (!recoveryCode.value.trim() || !newPassword.value.trim() || !confirmPassword.value.trim()) return false
  if (newPassword.value.trim() !== confirmPassword.value.trim()) return false
  return passwordComplexityRule(newPassword.value) === true
})

const recoveryCodeParam = computed(() => {
  return route.params.code
})

onMounted(() => {
  if (recoveryCodeParam.value) {
    recoveryCode.value = recoveryCodeParam.value as string
  }
})

function confirmPasswordRule(value: string) {
  return newPassword.value.trim() === confirmPassword.value.trim() || t('validation.password.confirmed')
}

const passwordRules = computed(() => passwordRulesState(newPassword.value))

async function submitResetPassword() {
  if (!isFormValid.value) return

  try {
    loading.value = true
    await recoveryPasswordComplete(recoveryCode.value.trim(), newPassword.value.trim())
    success.value = true
  } catch (err) {
    if (err instanceof ClientError) {
      inputErrors.value = err.inputErrors
    } if (err instanceof Error) {
      errorMsg.value = err.message
    }
    const error = err as Error
    errorMsg.value = error.message
  } finally {
    loading.value = false
  }

}

</script>

<template>
  <v-sheet>

    <template v-if="success">
      <v-card>
        <v-card-text>
          <v-alert type="success">
            {{ t('user.passwordChanged') }}
          </v-alert>
        </v-card-text>
        <v-card-text class="text-center">
          <v-btn color="primary" @click="router.push('/login')">{{ t('user.action.login') }}</v-btn>
        </v-card-text>
      </v-card>

    </template>

    <template v-else>

      <v-form @submit.prevent="submitResetPassword">
        <v-card variant="elevated">
          <v-card-title class="pa-4">{{ t('user.action.recoveryPassword') }}</v-card-title>
          <v-card-text v-if="errorMsg">
            <v-alert type="error">
              {{ te(errorMsg) ? t(errorMsg) : errorMsg }}
            </v-alert>
          </v-card-text>
          <v-card-text>
            <div class="text-subtitle-1 text-medium-emphasis">{{ t('user.field.recoveryCode') }}</div>
            <v-text-field variant="outlined" id="recovery-code-input" v-model="recoveryCode"
              prepend-inner-icon="mdi-code-braces-box" required readonly
              :error-messages="$ta(inputErrors?.recoveryCode)"></v-text-field>

            <div class="text-subtitle-1 text-medium-emphasis">{{ t('user.field.newPassword') }}</div>
            <!-- NEW PASSWORD-->
            <v-text-field variant="outlined" id="new-password-input" v-model="newPassword"
              :type="newPasswordVisibility ? 'text' : 'password'" required prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="newPasswordVisibility ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="newPasswordVisibility = !newPasswordVisibility" autocomplete="new-password"
              :error-messages="$ta(inputErrors?.newPassword)" :rules="[passwordComplexityRule]"></v-text-field>
            <div v-if="passwordRules.length">
              <div v-for="(rule, index) in passwordRules" :key="index" class="d-flex align-center">
                <v-icon :color="rule.valid ? 'success' : 'grey'" size="18" class="mr-2">
                  {{ rule.valid ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                </v-icon>

                <span :class="rule.valid ? 'text-success' : 'text-grey'">
                  {{ rule.label }}
                </span>
              </div>
            </div>
            <div class="text-subtitle-1 text-medium-emphasis">{{ t('user.field.confirmPassword') }}</div>
            <!-- CONFIRM PASSWORD-->
            <v-text-field variant="outlined" id="confirm-password-input" v-model="confirmPassword"
              :type="newPasswordVisibility ? 'text' : 'password'" required prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="newPasswordVisibility ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="newPasswordVisibility = !newPasswordVisibility" autocomplete="new-password"
              :error-messages="$ta(inputErrors?.confirmPassword)" :rules="[confirmPasswordRule]"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="mb-8" color="blue" size="large" variant="tonal" id="submit-button" type="submit" block
              :disabled="!isFormValid">
              {{ t('action.sent') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </template>
  </v-sheet>
</template>

<style scoped lang="sass">
// Your styles here
</style>