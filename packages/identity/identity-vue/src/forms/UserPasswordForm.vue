<script setup lang="ts">
import {ref, defineModel, type PropType, computed} from "vue";
import type {IClientInputError} from "@drax/common-front";
import type {IUser, IUserPassword} from "@drax/identity-front";
import {useI18nValidation} from "../composables/useI18nValidation";
import {useI18n} from "vue-i18n";

const {t} = useI18n()
const {$ta} = useI18nValidation()

let newPasswordVisibility = ref(false)


const props = defineProps({
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


</script>

<template>

  <v-sheet v-if="passwordChanged">
    <v-alert type="success">
      {{ $t('user.passwordChanged') }}
    </v-alert>
  </v-sheet>
  <v-sheet v-else>
    <form ref="changeUserPassword">

      <div class="text-subtitle-1 text-medium-emphasis">{{ $t('user.newPassword') }}</div>
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
      <div class="text-subtitle-1 text-medium-emphasis">{{ $t('user.confirmPassword') }}</div>
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
