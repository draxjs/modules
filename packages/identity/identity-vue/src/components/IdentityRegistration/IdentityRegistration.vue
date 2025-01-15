<script setup lang="ts">
import {computed, ref, onMounted} from 'vue'
import {useAuth} from "../../composables/useAuth.js";
import {ClientError} from "@drax/common-front";
import type {IClientInputError} from "@drax/common-front";
import {useI18nValidation} from "@drax/common-vue";
import {useI18n} from "vue-i18n";
import {useRoute, useRouter} from "vue-router"

const {t,te} = useI18n()
const {$ta} = useI18nValidation()

const route = useRoute()
const router = useRouter()

const {register} = useAuth()

const rform = ref()

const variant = ref('filled')

const form = ref({
  username: '',
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const inputErrors = ref<IClientInputError|undefined>({currentPassword: [], newPassword: [], confirmPassword: []})
const errorMsg = ref('')
const loading = ref(false)
const success = ref(false)

let passwordVisibility = ref(false)
let confirmPasswordVisibility = ref(false)


function confirmPasswordRule(value: string) {
  return form.value.password.trim() === form.value.confirmPassword.trim() || t('validation.password.confirmed')
}

async function submitRegistration() {
  try {
    loading.value = true
    await register(form.value)
    success.value = true
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

    <template v-if="success">
      <v-card>
        <v-card-text>
          <v-alert type="success">
            {{ t('user.event.registrationComplete') }}
          </v-alert>
        </v-card-text>
        <v-card-text class="text-center">
          <v-btn color="primary" @click="router.push('/login')">{{ t('user.action.login') }}</v-btn>
        </v-card-text>
      </v-card>

    </template>

    <template v-else>

          <v-form ref="rform" @submit.prevent="submitRegistration">
            <v-card variant="elevated">
              <v-card-title class="pa-4">{{ t('user.action.register') }}</v-card-title>
              <v-card-text v-if="errorMsg">
                <v-alert type="error">
                  {{ te(errorMsg) ?t(errorMsg) : errorMsg }}
                </v-alert>
              </v-card-text>
              <v-card-text>
                <v-text-field
                    id="name-input"
                    :label="t('user.field.name')"
                    v-model="form.name"
                    prepend-inner-icon="mdi-card-account-details"
                    :variant="variant"
                    :rules="[v => !!v || t('validation.required')]"
                    :error-messages="$ta(inputErrors?.name)"

                ></v-text-field>

                <v-text-field
                    id="username-input"
                    :label="t('user.field.username')"
                    v-model="form.username"
                    prepend-inner-icon="mdi-account-question"
                    :variant="variant"
                    :rules="[v => !!v || t('validation.required')]"
                    autocomplete="new-username"
                    :error-messages="$ta(inputErrors?.username)"

                ></v-text-field>

                <v-text-field
                    v-model="form.email"
                    :variant="variant"
                    id="email-input"
                    :label="t('user.field.email')"
                    prepend-inner-icon="mdi-email"
                    :rules="[(v:any) => !!v || t('validation.required')]"
                    :error-messages="$ta(inputErrors?.email)"
                ></v-text-field>

                <v-text-field
                    v-model="form.phone"
                    :variant="variant"
                    id="phone-input"
                    :label="t('user.field.phone')"
                    prepend-inner-icon="mdi-phone"
                    :rules="[(v:any) => !!v || t('validation.required')]"
                    :error-messages="$ta(inputErrors?.phone)"
                ></v-text-field>


                <div class="text-subtitle-1 text-medium-emphasis">{{ t('user.field.newPassword') }}</div>
                <!-- NEW PASSWORD-->
                <v-text-field
                    :variant="variant"
                    id="new-password-input"
                    v-model="form.password"
                    :type="passwordVisibility ? 'text': 'password'"
                    required
                    prepend-inner-icon="mdi-lock-outline"
                    :append-inner-icon="passwordVisibility ? 'mdi-eye-off': 'mdi-eye'"
                    @click:append-inner="passwordVisibility = !passwordVisibility"
                    autocomplete="new-password"
                    :error-messages="$ta(inputErrors?.newPassword)"
                ></v-text-field>
                <div class="text-subtitle-1 text-medium-emphasis">{{ t('user.field.confirmPassword') }}</div>
                <!-- CONFIRM PASSWORD-->
                <v-text-field
                    :variant="variant"
                    id="confirm-password-input"
                    v-model="form.confirmPassword"
                    :type="confirmPasswordVisibility ? 'text': 'password'"
                    required
                    prepend-inner-icon="mdi-lock-outline"
                    :append-inner-icon="confirmPasswordVisibility ? 'mdi-eye-off': 'mdi-eye'"
                    @click:append-inner="confirmPasswordVisibility = !confirmPasswordVisibility"
                    autocomplete="new-password"
                    :error-messages="$ta(inputErrors?.confirmPassword)"
                    :rules="[confirmPasswordRule]"
                ></v-text-field>
              </v-card-text>
              <v-card-actions>

                <v-btn
                    color="grey"
                    variant="text"
                    id="submit-button"
                    type="submit"
                    href="/login"
                >
                  {{ t('auth.login') }}
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
                    color="blue"
                    variant="tonal"
                    id="submit-button"
                    type="submit"
                    :loading="loading"
                >
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
