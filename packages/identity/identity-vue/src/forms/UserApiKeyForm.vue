<script setup lang="ts">
import {defineModel, type PropType} from "vue";
import type {IUserApiKeyBase} from "@drax/identity-share";
import {useI18nValidation} from "@drax/common-vue";
import type {IClientInputError} from "@drax/common-front";
import {useI18n} from "vue-i18n";

const {$ta} = useI18nValidation()
const {t} = useI18n()

defineProps({
  inputErrors: {
    type: Object as PropType<IClientInputError>,
    default: () => ({name: "", ipv4: "", ipv6: ""})
  }
})

const form = defineModel<IUserApiKeyBase>({
  type: Object,
  default: () => ({name: "", ipv4: [], ipv6: []})
})

// Define emits
const emits = defineEmits(['formSubmit'])

// Function to call when form is attempted to be submitted
const onSubmit = () => {
  emits('formSubmit', form); // Emitting an event with the form data
}

const ipv6Regex = /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/
const ipv4Regex = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/

const ipv4Address = [
  (v: string[]) => !v.some(ip => !ipv4Regex.test(ip)) || t('validation.invalidIpv4'),
]

const ipv6Address = [
  (v: string[]) => !v.some(ip => !ipv6Regex.test(ip))  || t('validation.invalidIpv6'),
]

</script>

<template>
  <v-form @submit.prevent="onSubmit" validate-on="blur">
    <v-text-field
        variant="outlined"
        id="name-input"
        :label="t('userApiKey.name')"
        v-model="form.name"
        prepend-inner-icon="mdi-card-account-details"
        required
        :error-messages="$ta(inputErrors.name)"
    ></v-text-field>

    <v-combobox
        v-model="form.ipv4 as string[]"
        :label="t('userApiKey.ipv4')"
        variant="outlined"
        multiple chips
        validate-on="blur"
        :rules="ipv4Address"
    ></v-combobox>

    <v-combobox
        v-model="form.ipv6 as string[]"
        :label="t('userApiKey.ipv6')"
        variant="outlined"
        multiple chips
        validate-on="blur"
        :rules="ipv6Address"
    ></v-combobox>

  </v-form>
</template>

<style scoped>

</style>
