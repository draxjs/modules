<script setup lang="ts">
import {computed, ref, defineEmits} from 'vue'
import {useAuth} from '../../composables/useAuth.js'
import IdentityProfileView from "../IdentityProfileView/IdentityProfileView.vue";

const {login, isAuthenticated} = useAuth()

const username = ref('')
const password = ref('')
const authError = ref('')
const loading = ref(false)

const isFormValid = computed(() => username.value.trim() !== '' && password.value.trim() !== '')

const emit = defineEmits(['loginSuccess'])

async function submitLogin() {
  try {
    loading.value = true
    await login(username.value, password.value)
    emit('loginSuccess')
  } catch (e) {
    const error = e as Error
    authError.value = error.message
  } finally {
    loading.value = false
  }
}


let passwordVisibility = ref(false)

function togglePasswordVisibility() {
  passwordVisibility.value = !passwordVisibility.value
}

</script>

<template>

  <template v-if="isAuthenticated()">
        <v-card>
          <v-card-text>
            <identity-profile-view></identity-profile-view>
          </v-card-text>
        </v-card>
  </template>

  <template v-else>

        <v-form @submit.prevent="submitLogin">
          <v-card variant="elevated" class="pa-6">
            <v-card-title class="pa-4 text-center">{{ $t ? $t('auth.signIn') : 'Sign In' }}</v-card-title>
            <v-card-text v-if="authError">
              <v-alert type="error">
                {{ $t ? $t(authError) : authError }}
              </v-alert>
            </v-card-text>
            <v-card-text>
              <div class="text-subtitle-1 text-medium-emphasis">{{ $t ? $t('auth.username') : 'Username' }}</div>
              <v-text-field
                  variant="outlined"
                  id="username-input"
                  v-model="username"
                  prepend-inner-icon="mdi-lock-outline"
                  required
                  autocomplete="new-username"
              ></v-text-field>
              <div class="text-subtitle-1 text-medium-emphasis">{{ $t ? $t('auth.password') : 'Password' }}</div>
              <v-text-field
                  variant="outlined"
                  id="password-input"
                  v-model="password"
                  :type="passwordVisibility ? 'text': 'password'"
                  required
                  prepend-inner-icon="mdi-lock-outline"
                  :append-inner-icon="passwordVisibility ? 'mdi-eye-off': 'mdi-eye'"
                  @click:append-inner="togglePasswordVisibility"
                  autocomplete="new-password"
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
                  :loading="loading"
              >
                {{ $t ? $t('auth.login') : 'Login' }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
  </template>
</template>

<style scoped>
</style>
