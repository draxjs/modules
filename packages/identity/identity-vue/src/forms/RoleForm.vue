<script setup lang="ts">
import {defineModel, type PropType} from "vue";
import type {IRoleBase} from "@drax/identity-share";
import {useI18nValidation} from "@drax/common-vue";
import type {IClientInputError} from "@drax/common-front";
import PermissionSelector from "../components/PermissionSelector/PermissionSelector.vue";
import RoleCombobox from "../combobox/RoleCombobox.vue";

const {$ta} = useI18nValidation()

defineProps({
  inputErrors: {
    type: Object as PropType<IClientInputError>,
    default: () => ({name: "", permissions: "", readonly: ""})
  }
})

const form = defineModel<IRoleBase>({
  type: Object,
  default: () => ({name: "", permissions: [], readonly: false})
})

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

    <RoleCombobox
        v-model="form.childRoles"
        :error-messages="$ta(inputErrors.role)"
        multiple
    ></RoleCombobox>

    <PermissionSelector v-model="form.permissions"></PermissionSelector>

  </form>
</template>

<style scoped>

</style>
