<script setup lang="ts">
import {useFormUtils, useCrudStore} from "@drax/crud-vue";
import {defineEmits, defineModel, ref} from "vue";
import {useI18nValidation} from "@drax/common-vue";
import {useI18n} from "vue-i18n";
import {useIdentityCrudStore} from "../../stores/IdentityCrudStore";

const {$ta} = useI18nValidation()
const {t, te} = useI18n()

const valueModel = defineModel({type: [Object]})

const emit = defineEmits(['submit', 'cancel'])

const identityCrudStore = useIdentityCrudStore()
const entity = identityCrudStore.userApiKeyCrud

const store = useCrudStore(entity.name)

const valid = ref()
const formRef = ref()


async function submit() {
  store.resetErrors()
  await formRef.value.validate()
  if (valid.value) {
    emit('submit', valueModel.value)
  } else {
    console.log('Invalid form')
  }
}

function cancel() {
  emit('cancel')
}

const {
   submitColor
} = useFormUtils(store.operation)


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


  <v-form v-model="valid" ref="formRef" @submit.prevent="submit">
    <v-card flat>

      <template v-if="!valueModel.readonly || store.operation == 'view'">


        <v-card-subtitle v-if="valueModel._id">ID: {{ valueModel._id }}</v-card-subtitle>

        <v-card-text v-if="store.error">
          <v-alert color="error">{{ te(store.error) ? t(store.error) : store.error }}</v-alert>
        </v-card-text>

        <v-card-text>
          <v-text-field
              variant="outlined"
              id="name-input"
              :label="t('userapikey.field.name')"
              v-model="valueModel.name"
              prepend-inner-icon="mdi-card-account-details"
              required
              :error-messages="$ta(store.inputErrors?.name)"
          ></v-text-field>

          <v-combobox
              v-model="valueModel.ipv4 as string[]"
              :label="t('userapikey.field.ipv4')"
              variant="outlined"
              multiple chips
              validate-on="blur"
              :rules="ipv4Address"
              :error-messages="$ta(store.inputErrors?.ipv4)"
          ></v-combobox>

          <v-combobox
              v-model="valueModel.ipv6 as string[]"
              :label="t('userapikey.field.ipv6')"
              variant="outlined"
              multiple chips
              validate-on="blur"
              :rules="ipv6Address"
              :error-messages="$ta(store.inputErrors?.ipv6)"
          ></v-combobox>


        </v-card-text>
      </template>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
            variant="text"
            color="grey"
            @click="cancel">
          {{ t('action.cancel') }}
        </v-btn>
        <v-btn
            v-if="!valueModel.readonly && store.operation != 'view'"
            variant="flat"
            :color="submitColor"
            @click="submit"
        >
          {{ store.operation ? t('action.' + store.operation) : t('action.sent') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<style scoped>

</style>
