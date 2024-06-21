<script setup lang="ts">
import {ref, defineModel, type PropType} from "vue";
import RoleCombobox from "../combobox/RoleCombobox.vue";
import type {IClientInputError} from "@drax/common-front";
import type {IUserUpdate} from "@drax/identity-front/src/interfaces/IUser";
import {useI18nValidation} from "../composables/useI18nValidation";
const {$ta} = useI18nValidation()

const props = defineProps({
  inputErrors: {
    type: Object as PropType<IClientInputError>,
    default: () => ({name: "", username: "", email: "", phone: "", role: "", active: ""})
  }
})

const form = defineModel<IUserUpdate>({
  type: Object,
  default: () => ({name: "", username: "", email: "", phone: "", role: "", active: true})
})


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
        :error-messages="$ta(inputErrors.name)"
    ></v-text-field>
    <v-text-field
        variant="outlined"
        id="username-input"
        label="Username"
        v-model="form.username"
        prepend-inner-icon="mdi-account-question"
        required
        :error-messages="$ta(inputErrors.username)"
        autocomplete="new-username"
    ></v-text-field>

    <RoleCombobox
        v-model="form.role"
        :error-messages="$ta(inputErrors.role)"
    ></RoleCombobox>

    <v-text-field
        v-model="form.email"
        variant="outlined"
        id="email-input"
        label="Email"
        prepend-inner-icon="mdi-email"
        required
        :error-messages="$ta(inputErrors.email)"
    ></v-text-field>

    <v-text-field
        v-model="form.phone"
        variant="outlined"
        id="phone-input"
        label="Phone"
        prepend-inner-icon="mdi-phone"
        required
        :error-messages="$ta(inputErrors.phone)"
    ></v-text-field>

    <v-switch
        id="active-input"
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
