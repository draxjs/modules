<script setup lang="ts">
import {useI18n} from 'vue-i18n'
import {isRememberMeEnabled} from '../composables/setupAuthSession'

defineProps<{disabled?: boolean}>()
const model = defineModel<boolean>({default: false})
const {t} = useI18n({
  useScope: 'local',
  messages: {
    en: {rememberMe: 'Remember my session on this device'},
    es: {rememberMe: 'Recordar mi sesión en este dispositivo'},
  },
})
</script>

<template>
  <v-checkbox
      v-if="isRememberMeEnabled()"
      v-model="model"
      :label="t('rememberMe')"
      density="compact"
      hide-details
      :disabled="disabled"
      data-testid="remember-me"
  />
</template>
