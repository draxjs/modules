<script setup lang="ts">
import {defineModel, type PropType} from "vue";
import type {IRole} from "@drax/identity-front";
import {useI18nValidation} from "../composables/useI18nValidation";
import type {IClientInputError} from "@drax/common-front";
import PermissionSelector from "../components/PermissionSelector/PermissionSelector.vue";

const {$ta} = useI18nValidation()

const props = defineProps({
  inputErrors: {
    type: Object as PropType<IClientInputError>,
    default: () => ({name: "", permissions: "", readonly: ""})
  }
})

const form = defineModel<IRole>({
  type: Object,
  default: () => ({name: "", permissions: [], readonly: false})
})

</script>

<template>
  <form>
    <v-text-field
        variant="outlined"
        id="name-input"
        label="Name"
        v-model="form.name"
        prepend-inner-icon="mdi-card-account-details"
        required
        :error-messages="$ta(inputErrors.name)"
    ></v-text-field>


    <PermissionSelector v-model="form.permissions"></PermissionSelector>

  </form>
</template>

<style scoped>

</style>
