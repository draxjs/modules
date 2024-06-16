<script setup lang="ts">

import {ref, reactive} from "vue";
import RoleCombobox from "../combobox/RoleCombobox.vue";

let form = reactive({
  username: "",
  password: "",
  role: ""
})

let passwordVisibility = ref(false)

function togglePasswordVisibility() {
  passwordVisibility.value = !passwordVisibility.value
}
</script>

<template>
  <form>
    <v-text-field
        variant="outlined"
        id="username-input"
        label="Username"
        v-model="form.username"
        prepend-inner-icon="mdi-lock-outline"
        required
    ></v-text-field>
    <v-text-field
        variant="outlined"
        id="password-input"
        label="Password"
        v-model="form.password"
        :type="passwordVisibility ? 'text': 'password'"
        required
        prepend-inner-icon="mdi-lock-outline"
        :append-inner-icon="passwordVisibility ? 'mdi-eye-off': 'mdi-eye'"
        @click:append-inner="togglePasswordVisibility"
    ></v-text-field>

    <RoleCombobox
        v-model="form.role"
    ></RoleCombobox>
  </form>
</template>

<style scoped>

</style>
