<script setup lang="ts">
import {computed, defineProps, ref} from 'vue'
import {useAuth} from '../../composables/useAuth.js'
import IdentityProfileView from "../IdentityProfileView/IdentityProfileView.vue";

const {login, isAuthenticated} = useAuth()

const username = ref('')
const password = ref('')
const authError = ref('')
const loading = ref(false)

const isFormValid = computed(() => username.value.trim() !== '' && password.value.trim() !== '')

async function submitLogin() {
  try {
    loading.value = true
    await login(username.value, password.value)
  } catch (e) {
    const error = e as Error
    authError.value = error.message
  } finally {
    loading.value = false
  }
}

// Define props for customizing labels, title, and button text
const props = defineProps({
  title: {
    type: String,
    default: 'Login'
  },
  usernameLabel: {
    type: String,
    default: 'Username'
  },
  passwordLabel: {
    type: String,
    default: 'Password'
  },
  buttonText: {
    type: String,
    default: 'Login'
  }
})

let passwordVisibility = ref(false)

function togglePasswordVisibility() {
  passwordVisibility.value = !passwordVisibility.value
}

</script>

<template>

  <template v-if="isAuthenticated()">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="5">
        <v-card>
          <identity-profile-view></identity-profile-view>
        </v-card>
      </v-col>
    </v-row>
  </template>

  <template v-else>
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="5">


        <v-form @submit.prevent="submitLogin">
          <v-card variant="elevated" class="pa-6">
            <v-card-title class="pa-4 text-center">{{ props.title }}</v-card-title>
            <v-card-text v-if="authError">
              <v-alert type="error">
                {{ $t ? $t(authError) : authError }}
              </v-alert>
            </v-card-text>
            <v-card-text>
              <div class="text-subtitle-1 text-medium-emphasis">{{ props.usernameLabel }}</div>
              <v-text-field
                  variant="outlined"
                  id="username-input"
                  v-model="username"
                  prepend-inner-icon="mdi-lock-outline"
                  required
                  autocomplete="new-username"
              ></v-text-field>
              <div class="text-subtitle-1 text-medium-emphasis">{{ props.passwordLabel }}</div>
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
                {{ props.buttonText }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-form>


      </v-col>
    </v-row>
  </template>
</template>

<style scoped lang="sass">
// Your styles here
</style>
