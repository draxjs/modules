<script setup lang="ts">
import {ref, defineModel, type PropType, computed} from "vue";
import type {IClientInputError} from "@drax/common-front";
import type {IUser, IUserPassword} from "@drax/identity-front";
import {useI18nValidation} from "../composables/useI18nValidation";
const {$ta} = useI18nValidation()

const confirmPassword = ref('')
let newPasswordVisibility = ref(false)


const props = defineProps({
  inputErrors: {
    type: Object as PropType<IClientInputError>,
    default: () => ({id: "", newPassword: ""})
  }
})

const form = defineModel<IUserPassword>({
  type: Object,
  default: () => ({ newPassword: ""})
})

const isFormValid = computed(() => form.newPassword.value.trim() === confirmPassword.value.trim())




</script>

<template>
  <form>
    <v-sheet>
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
          v-model="confirmPassword"
          :type="newPasswordVisibility ? 'text': 'password'"
          required
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="newPasswordVisibility ? 'mdi-eye-off': 'mdi-eye'"
          @click:append-inner="newPasswordVisibility = !newPasswordVisibility"
          autocomplete="new-password"
          :error-messages="$ta(inputErrors.confirmPassword)"
      ></v-text-field>
    </v-sheet>


  </form>
</template>

<style scoped>

</style>
