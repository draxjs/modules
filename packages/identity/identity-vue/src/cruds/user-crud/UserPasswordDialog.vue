<script setup lang="ts">
import UserPasswordForm from "./UserPasswordForm.vue";
import { type PropType, ref, computed } from "vue";
import type {IUserPassword} from "@drax/identity-front";
import type {IUser} from "@drax/identity-share";
import {UserSystemFactory} from "@drax/identity-front";
import {ClientError, type IClientInputError} from "@drax/common-front";
import {useI18n} from "vue-i18n";
import { usePasswordValidation } from "../../composables/usePasswordValidation";

const {t} = useI18n()

const valueModel = defineModel({type: Boolean, default: false})

const {user} = defineProps({
  user: {type: Object as PropType<IUser>, required: true},
})

const userSystem = UserSystemFactory.getInstance()

 const { passwordComplexityRule } = usePasswordValidation()
 let passwordForm = ref<IUserPassword>({newPassword: "", confirmPassword: ""})
 let passwordChanged = ref(false);
 let inputErrors = ref<IClientInputError>()
 let loading = ref(false);
 let userError = ref<string>('')

const isFormValid = computed(() => {
  const { newPassword, confirmPassword } = passwordForm.value
  if (!newPassword || !confirmPassword) return false
  if (newPassword !== confirmPassword) return false
  return passwordComplexityRule(newPassword) === true
})

async function savePassword() {
  if (!isFormValid.value) return
  if (passwordForm.value.newPassword === passwordForm.value.confirmPassword) {
    await changeUserPassword(user._id, passwordForm.value.newPassword)
    passwordChanged.value = true
  }
}

async function changeUserPassword(id: string, newPassword: string) {
  try {
    loading.value = true
    return await userSystem.changeUserPassword(id, newPassword)
  } catch (err) {
    if (err instanceof ClientError) {
      inputErrors.value = err.inputErrors
    }
    if (err instanceof Error) {
      userError.value = err.message
    }
    throw err
  } finally {
    loading.value = false
  }
}

</script>

<template>
  <v-dialog v-model="valueModel" max-width="800">
    <v-card>
      <v-card-title>{{ t('user.operation.changePassword') }}</v-card-title>
      <v-card-subtitle>{{ t('user.field.username') }}: {{ user.username }}</v-card-subtitle>
      <v-card-text>
        <user-password-form
            v-model="passwordForm"
            :inputErrors="inputErrors"
            :passwordChanged="passwordChanged"
            @formSubmit="savePassword"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
            variant="text"
            color="grey"
            @click="valueModel = false">
          {{ passwordChanged ? t('action.close') : t('action.cancel') }}
        </v-btn>
        <v-btn
            v-if="!passwordChanged"
            variant="flat"
            color="primary"
            @click="savePassword"
            :loading="loading"
            :disabled="!isFormValid"
        >
          {{ t('action.change') }}
        </v-btn>
      </v-card-actions>

    </v-card>

  </v-dialog>
</template>

<style scoped>

</style>
