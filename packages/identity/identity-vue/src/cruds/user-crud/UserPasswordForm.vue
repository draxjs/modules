<script setup lang="ts">
import {ref, defineModel, type PropType} from "vue";
import type {IClientInputError} from "@drax/common-front";
import type {IUserPassword} from "@drax/identity-front";
import {useI18nValidation} from "@drax/common-vue";
import {useI18n} from "vue-i18n";

const {t} = useI18n()
const {$ta} = useI18nValidation()

let newPasswordVisibility = ref(false)


defineProps({
  inputErrors: {
    type: Object as PropType<IClientInputError>,
    default: () => ({id: "", newPassword: ""})
  },
  passwordChanged: {
    type: Boolean,
    default: false
  }
})

const form = defineModel<IUserPassword>({
  type: Object as PropType<IUserPassword>,
  default: () => ({newPassword: "", confirmPassword: ""})
})

function confirmPasswordRule(value: string) {
  return form.value.newPassword === form.value.confirmPassword || t('validation.password.confirmed')
}

// Define emits
const emits = defineEmits(['formSubmit'])

// Function to call when form is attempted to be submitted
const onSubmit = () => {
  emits('formSubmit', form); // Emitting an event with the form data
}
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
      <v-text-field
          variant="outlined"
          id="new-password-input"
          v-model="form.newPassword"
          :type="newPasswordVisibility ? 'text': 'password'"
          required
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="newPasswordVisibility ? 'mdi-eye-off': 'mdi-eye'"
          @click:append-inner="newPasswordVisibility = !newPasswordVisibility"
          autocomplete="new-password"
          :error-messages="$ta(inputErrors.newPassword)"
      ></v-text-field>

      <div class="text-subtitle-1 text-medium-emphasis">{{ t('user.field.confirmPassword') }}</div>

      <v-text-field
          variant="outlined"
          id="confirm-password-input"
          v-model="form.confirmPassword"
          :type="newPasswordVisibility ? 'text': 'password'"
          required
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="newPasswordVisibility ? 'mdi-eye-off': 'mdi-eye'"
          @click:append-inner="newPasswordVisibility = !newPasswordVisibility"
          autocomplete="new-password"
          :error-messages="$ta(inputErrors.confirmPassword)"
          :rules="[confirmPasswordRule]"
      ></v-text-field>
    </form>
  </v-sheet>

</template>

<style scoped>

</style>
