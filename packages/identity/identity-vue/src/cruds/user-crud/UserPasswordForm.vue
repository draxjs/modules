<script setup lang="ts">
import { computed, ref, type PropType } from "vue";
import type { IClientInputError } from "@drax/common-front";
import type { IUserPassword } from "@drax/identity-front";
import { useI18nValidation } from "@drax/common-vue";
import { useI18n } from "vue-i18n";
import { usePasswordValidation } from "../../composables/usePasswordValidation";

const { t } = useI18n()
const { $ta } = useI18nValidation()

const { passwordRulesState, passwordComplexityRule } = usePasswordValidation()

let newPasswordVisibility = ref(false)

defineProps({
  inputErrors: {
    type: Object as PropType<IClientInputError>,
    default: () => ({ id: "", newPassword: "" })
  },
  passwordChanged: {
    type: Boolean,
    default: false
  }
})

const form = defineModel<IUserPassword>({
  type: Object as PropType<IUserPassword>,
  default: () => ({ newPassword: "", confirmPassword: "" })
})

const isFormValid = computed(() => {
  if (!form.value.newPassword || !form.value.confirmPassword) return false
  if (form.value.newPassword !== form.value.confirmPassword) return false
  return passwordComplexityRule(form.value.newPassword) === true
})

function confirmPasswordRule(value: string) {
  return form.value.newPassword === form.value.confirmPassword || t('validation.password.confirmed')
}

const passwordRules = computed(() => passwordRulesState(form.value.newPassword))

function onSubmit() {
  if (!isFormValid.value) return
}

defineExpose({ isFormValid })

</script>

<template>

  <v-sheet v-if="passwordChanged">
    <v-alert type="success">
      {{ t('user.passwordChanged') }}
    </v-alert>
  </v-sheet>
  <v-sheet v-else>
    <form ref="changeUserPassword" @submit.prevent="onSubmit">

      <div class="text-subtitle-1 text-medium-emphasis">{{ t('user.field.newPassword') }}</div>
      <v-text-field variant="outlined" id="new-password-input" v-model="form.newPassword"
        :type="newPasswordVisibility ? 'text' : 'password'" required prepend-inner-icon="mdi-lock-outline"
        :append-inner-icon="newPasswordVisibility ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append-inner="newPasswordVisibility = !newPasswordVisibility" autocomplete="new-password"
        :error-messages="$ta(inputErrors.newPassword)" :rules="[passwordComplexityRule]"></v-text-field>

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

      <v-text-field variant="outlined" id="confirm-password-input" v-model="form.confirmPassword"
        :type="newPasswordVisibility ? 'text' : 'password'" required prepend-inner-icon="mdi-lock-outline"
        :append-inner-icon="newPasswordVisibility ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append-inner="newPasswordVisibility = !newPasswordVisibility" autocomplete="new-password"
        :error-messages="$ta(inputErrors.confirmPassword)" :rules="[confirmPasswordRule]"></v-text-field>
    </form>
  </v-sheet>

</template>

<style scoped></style>