<script setup lang="ts">
import { ref, computed, defineProps } from 'vue'
import {useAuthStore} from "../../stores/auth/AuthStore.js";

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

// Define reactive variables for form inputs
const username = ref('')
const password = ref('')

// Compute whether the form is valid (both username and password are not empty)
const isFormValid = computed(() => username.value.trim() !== '' && password.value.trim() !== '')

// Function to handle form submission
const submitForm = async () => {
  console.log('Submitting:', { username: username.value, password: password.value })
  const loginResponse = await authStore.getAuthSystem?.login(username.value, password.value)
  if(loginResponse){
    authStore.setAccessToken(loginResponse.accessToken)
    const authUser = await authStore.getAuthSystem?.me()
    console.log("Login authUser", authUser)
    if(authUser){
      authStore.setAuthUser(authUser)
    }
  }
}
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="5" xl="4" >
        <v-form @submit.prevent="submitForm">
          <v-card variant="tonal">
            <v-card-title>{{ props.title }}</v-card-title>
            <v-card-text>
              <v-text-field
                id="username-input"
                v-model="username"
                :label="props.usernameLabel"
                required
              ></v-text-field>
              <v-text-field
                id="password-input"
                v-model="password"
                :label="props.passwordLabel"
                type="password"
                required
              ></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                id="submit-button"
                type="submit"
                color="primary"
                :disabled="!isFormValid"
              >{{ props.buttonText }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped lang="sass">
// Your styles here
</style>
