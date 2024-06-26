<script setup lang="ts">
import {computed, ref} from 'vue'
import {useAuth} from "../../composables/useAuth.js";
import {ClientError} from "@drax/common-front";
import type {IClientInputError} from "@drax/common-front";
import {useI18nValidation} from "@drax/common-vue";
import {useI18n} from "vue-i18n";

const {t} = useI18n()
const {$ta} = useI18nValidation()

const {changeOwnPassword} = useAuth()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const inputErrors = ref<IClientInputError|undefined>({currentPassword: [], newPassword: [], confirmPassword: []})
const errorMsg = ref('')
const loading = ref(false)
const changed = ref(false)

let currentPasswordVisibility = ref(false)
let newPasswordVisibility = ref(false)

const isFormValid = computed(() =>
    currentPassword.value.trim() !== '' && newPassword.value.trim() !== ''
    && newPassword.value.trim() === confirmPassword.value.trim()
)

function confirmPasswordRule(value: string) {
  return newPassword.value.trim() === confirmPassword.value.trim() || t('validation.password.confirmed')
}

async function submitChangePassowrd() {
  try {
    loading.value = true
    await changeOwnPassword(currentPassword.value.trim(), newPassword.value.trim())
    changed.value = true
  } catch (err) {
    if (err instanceof ClientError) {
      inputErrors.value = err.inputErrors
    }if(err instanceof Error) {
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

    <template v-if="changed">
      <v-alert type="success">
        {{ $t('user.passwordChanged') }}
      </v-alert>
    </template>

    <template v-else>

          <v-form @submit.prevent="submitChangePassowrd">
            <v-card variant="outlined">
              <v-card-title class="pa-4 text-center">{{ $t('user.changeOwnPassword') }}</v-card-title>
              <v-card-text v-if="errorMsg">
                <v-alert type="error">
                  {{ $t ? $t(errorMsg) : errorMsg }}
                </v-alert>
              </v-card-text>
              <v-card-text>
                <div class="text-subtitle-1 text-medium-emphasis">{{ $t('user.currentPassword') }}</div>
                <v-text-field
                    variant="outlined"
                    id="current-password-input"
                    v-model="currentPassword"
                    prepend-inner-icon="mdi-lock-outline"
                    required
                    :type="currentPasswordVisibility ? 'text': 'password'"
                    :append-inner-icon="currentPasswordVisibility ? 'mdi-eye-off': 'mdi-eye'"
                    @click:append-inner="currentPasswordVisibility = !currentPasswordVisibility"
                    autocomplete="new-password"
                    :error-messages="$ta(inputErrors?.currentPassword)"
                ></v-text-field>
                <div class="text-subtitle-1 text-medium-emphasis">{{ $t('user.newPassword') }}</div>
                <v-text-field
                    variant="outlined"
                    id="new-password-input"
                    v-model="newPassword"
                    :type="newPasswordVisibility ? 'text': 'password'"
                    required
                    prepend-inner-icon="mdi-lock-outline"
                    :append-inner-icon="newPasswordVisibility ? 'mdi-eye-off': 'mdi-eye'"
                    @click:append-inner="newPasswordVisibility = !newPasswordVisibility"
                    autocomplete="new-password"
                    :error-messages="$ta(inputErrors?.newPassword)"
                ></v-text-field>
                <div class="text-subtitle-1 text-medium-emphasis">{{ $t('user.confirmPassword') }}</div>
                <v-text-field
                    variant="outlined"
                    id="confirm-password-input"
                    v-model="confirmPassword"
                    :type="newPasswordVisibility ? 'text': 'password'"
                    required
                    prepend-inner-icon="mdi-lock-outline"
                    :append-inner-icon="newPasswordVisibility ? 'mdi-eye-off': 'mdi-eye'"
                    @click:append-inner="newPasswordVisibility = !newPasswordVisibility"
                    autocomplete="new-password"
                    :error-messages="$ta(inputErrors?.confirmPassword)"
                    :rules="[confirmPasswordRule]"
                ></v-text-field>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    class="mb-8"
                    color="blue"
                    size="large"
                    variant="tonal"
                    id="submit-button"
                    type="submit"
                    block
                    :disabled="!isFormValid"
                >
                  {{ $t('action.sent') }}
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
