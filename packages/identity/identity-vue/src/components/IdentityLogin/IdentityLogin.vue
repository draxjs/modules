<script setup lang="ts">
import {defineProps, ref} from 'vue'
import {useIdentityLogin} from '../../composables/useIdentityLogin.js'
import {useAuthStore} from "../../stores/auth/AuthStore.js";
import IdentityProfileView from "../IdentityProfileView/IdentityProfileView.vue";

const {username, password, isFormValid, submitLogin, authError} = useIdentityLogin()
const authStore = useAuthStore()

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

function togglePasswordVisibility(){
  passwordVisibility.value = !passwordVisibility.value
}

</script>

<template>
  <v-container>

    <template v-if="authStore.isAuth">
      <v-card>
        <identity-profile-view></identity-profile-view>
      </v-card>
    </template>

    <template v-else>
      <v-row justify="center">
        <v-col cols="12" sm="8" md="6" lg="5" xl="4">
          <v-form @submit.prevent="submitLogin">
            <v-card variant="tonal" class="pa-6">
              <v-card-title class="pa-4 text-center">{{ props.title }}</v-card-title>
              <v-card-text v-if="authError">
                <v-alert type="error">
                  {{ $t ? $t(authError) : authError }}
                </v-alert>
              </v-card-text>
              <v-card-text>
                <div class="text-subtitle-1 text-medium-emphasis">{{props.usernameLabel}}</div>
                <v-text-field
                    variant="outlined"
                    id="username-input"
                    v-model="username"
                    prepend-inner-icon="mdi-lock-outline"
                    required
                ></v-text-field>
                <div class="text-subtitle-1 text-medium-emphasis">{{props.passwordLabel}}</div>
                <v-text-field
                    variant="outlined"
                    id="password-input"
                    v-model="password"
                    :type="passwordVisibility ? 'text': 'password'"
                    required
                    prepend-inner-icon="mdi-lock-outline"
                    :append-inner-icon="passwordVisibility ? 'mdi-eye-off': 'mdi-eye'"
                    @click:append-inner="togglePasswordVisibility"
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
                >
                  {{ props.buttonText }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-form>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<style scoped lang="sass">
// Your styles here
</style>
