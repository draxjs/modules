<script setup lang="ts">
import {ref, defineModel, type PropType} from "vue";
import RoleCombobox from "../combobox/RoleCombobox.vue";
import type {IUser} from "@drax/identity-front";
import type {IClientInputError} from "@drax/common-front";


const props = defineProps({
  inputErrors: {
    type: Object as PropType<IClientInputError>,
    default: () => ({name: "", username: "", password: "", email: "", phone: "", role: "", active: ""})
  }
})

const form = defineModel<IUser>({
  type: Object,
  default: () => ({name: "", username: "", password: "", email: "", phone: "", role: "", active: true})
})

let passwordVisibility = ref(false)
function togglePasswordVisibility() {
  passwordVisibility.value = !passwordVisibility.value
}
</script>

<template>
  <form>
    <v-sheet>
    </v-sheet>

    <v-text-field
        variant="outlined"
        id="name-input"
        label="Name"
        v-model="form.name"
        prepend-inner-icon="mdi-card-account-details"
        required
        :error-messages="inputErrors.name"
    ></v-text-field>
    <v-text-field
        variant="outlined"
        id="username-input"
        label="Username"
        v-model="form.username"
        prepend-inner-icon="mdi-account-question"
        required
        :error-messages="inputErrors.username"
        autocomplete="new-username"
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
        autocomplete="new-password"
        :error-messages="inputErrors.password"
    ></v-text-field>

    <RoleCombobox
        v-model="form.role"
    ></RoleCombobox>

    <v-text-field
        v-model="form.email"
        variant="outlined"
        id="name-input"
        label="Email"
        prepend-inner-icon="mdi-email"
        required
        :error-messages="inputErrors.email"
    ></v-text-field>

    <v-text-field
        v-model="form.phone"
        variant="outlined"
        id="name-input"
        label="Phone"
        prepend-inner-icon="mdi-phone"
        required
        :error-messages="inputErrors.phone"
    ></v-text-field>

    <v-switch
        v-model="form.active"
        color="primary"
        label="Active"
        :true-value="true"
        :false-value="false"
    ></v-switch>
  </form>
</template>

<style scoped>

</style>
