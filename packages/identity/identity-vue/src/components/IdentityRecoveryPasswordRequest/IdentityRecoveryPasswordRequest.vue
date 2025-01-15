<script setup lang="ts">
import {computed, ref} from 'vue'
import {useAuth} from "../../composables/useAuth.js";
import {ClientError} from "@drax/common-front";
import type {IClientInputError} from "@drax/common-front";
import {useI18nValidation} from "@drax/common-vue";
import {useI18n} from "vue-i18n";

const {t,te} = useI18n()
const {$ta} = useI18nValidation()

const {recoveryPasswordRequest} = useAuth()

const email = ref('')
const inputErrors = ref<IClientInputError|undefined>({currentPassword: [], newPassword: [], confirmPassword: []})
const errorMsg = ref('')
const loading = ref(false)
const success = ref(false)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const emailRules = [(v:any) => emailRegex.test(v) || te('validation.email.invalid')]

const isFormValid = computed(() =>
    email.value.trim() !== '' && emailRegex.test(email.value)
)


async function submitResetPassword() {
  try {
    loading.value = true
    const r = await recoveryPasswordRequest(email.value.trim())

    console.log(r)

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
      <v-alert type="success">
        {{ t('user.events.recoveryPasswordInfo') }}
      </v-alert>
    </template>

    <template v-else>

          <v-form @submit.prevent="submitResetPassword">
            <v-card variant="elevated">
              <v-card-title class="pa-4">{{ t('user.action.recoveryPasswordRequest') }}</v-card-title>
              <v-card-text v-if="errorMsg">
                <v-alert type="error">
                  {{ te(errorMsg) ?t(errorMsg) : errorMsg }}
                </v-alert>
              </v-card-text>
              <v-card-text>
                <div class="text-subtitle-1 text-medium-emphasis">{{ t('user.field.email') }}</div>
                <!-- USER EMAIL-->
                <v-text-field
                    variant="outlined"
                    id="recovery-code-input"
                    v-model="email"
                    prepend-inner-icon="mdi-lock-outline"
                    required
                    autocomplete="new-password"
                    :error-messages="$ta(inputErrors?.recoveryCode)"
                    :rules="emailRules"
                ></v-text-field>

              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    :loading="loading"
                    class="mb-8"
                    color="blue"
                    size="large"
                    variant="tonal"
                    id="submit-button"
                    type="submit"
                    block
                    :disabled="!isFormValid"
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

</style>
