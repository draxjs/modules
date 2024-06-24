<script setup lang="ts">
import {defineModel, type PropType} from "vue";
import type {ITenantBase} from "@drax/identity-front";
import {useI18nValidation} from "../composables/useI18nValidation";
import type {IClientInputError} from "@drax/common-front";

const {$ta} = useI18nValidation()

defineProps({
  inputErrors: {
    type: Object as PropType<IClientInputError>,
    default: () => ({name: ""})
  }
})

const form = defineModel<ITenantBase>({
  type: Object,
  default: () => ({name: ""})
})

// Define emits
const emits = defineEmits(['formSubmit'])

// Function to call when form is attempted to be submitted
const onSubmit = () => {
  emits('formSubmit', form); // Emitting an event with the form data
}

</script>

<template>
  <form @submit.prevent="onSubmit">
    <v-text-field
        variant="outlined"
        id="name-input"
        label="Name"
        v-model="form.name"
        prepend-inner-icon="mdi-card-account-details"
        required
        :error-messages="$ta(inputErrors.name)"
    ></v-text-field>

  </form>
</template>

<style scoped>

</style>
