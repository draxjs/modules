<script setup lang="ts">
import {useFormUtils, useCrudStore} from "@drax/crud-vue";
import {computed, defineEmits, defineModel, ref} from "vue";
import {useI18nValidation} from "@drax/common-vue";
import RoleCombobox from "../../combobox/RoleCombobox.vue";
import TenantCombobox from "../../combobox/TenantCombobox.vue";
import {useAuth} from "../../composables/useAuth";
import {useI18n} from "vue-i18n";
import {useIdentityCrudStore} from "../../stores/IdentityCrudStore";

const {$ta} = useI18nValidation()
const {t, te} = useI18n()

const {hasPermission} = useAuth()


const valueModel = defineModel({type: [Object]})

const emit = defineEmits(['submit', 'cancel'])

const store = useCrudStore()
const enablePassword = store.operation === 'create'

const identityCrudStore = useIdentityCrudStore()
const entity = identityCrudStore.userCrud

const valid = ref()
const formRef = ref()

// Add this computed property
const isTenantEnabled = computed(() => import.meta.env.VITE_DRAX_TENANT === 'ENABLE')



async function submit() {
  store.resetErrors()

  if(store.operation === 'delete') {
    emit('submit',valueModel.value)
    return
  }

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
   submitColor, readonly
} = useFormUtils(store.operation)


const variant = computed(() => {
  if (store.operation === 'create') {
    return entity.inputVariantCreate
  } else if (store.operation === 'edit') {
    return entity.inputVariantEdit
  } else if (store.operation === 'delete') {
    return entity.inputVariantDelete
  } else if (store.operation === 'view') {
    return entity.inputVariantView
  }
  return 'outlined'
})


let passwordVisibility = ref(false)

</script>

<template>
  <v-form v-model="valid" ref="formRef" @submit.prevent="submit">
    <v-card flat>

      <v-alert v-if="valueModel.readonly && store.operation != 'view'" type="warning">
        {{ t('role.readonly') }}
      </v-alert>

      <v-card-subtitle v-if="valueModel.id">ID: {{ valueModel.id }}</v-card-subtitle>

      <v-card-text v-if="store.error">
        <v-alert color="error">{{ te(store.error) ? t(store.error) : store.error }}</v-alert>
      </v-card-text>

      <v-card-text>

        <v-text-field
            id="name-input"
            :label="t('user.field.name')"
            v-model="valueModel.name"
            prepend-inner-icon="mdi-card-account-details"
            :variant="variant"
            :rules="[v => !!v || t('validation.required')]"
            :error-messages="$ta(store.inputErrors?.name)"
            :readonly="readonly"
        ></v-text-field>

        <v-text-field
            id="username-input"
            :label="t('user.field.username')"
            v-model="valueModel.username"
            prepend-inner-icon="mdi-account-question"
            :variant="variant"
            :rules="[v => !!v || t('validation.required')]"
            autocomplete="new-username"
            :error-messages="$ta(store.inputErrors?.username)"
            :readonly="readonly"
        ></v-text-field>

        <v-text-field
            v-if="enablePassword"
            id="password-input"
            :label="t('user.field.password')"
            v-model="valueModel.password"
            :type="passwordVisibility ? 'text': 'password'"
            :variant="variant"
            :rules="[v => !!v || t('validation.required')]"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="passwordVisibility ? 'mdi-eye-off': 'mdi-eye'"
            @click:append-inner="passwordVisibility = !passwordVisibility"
            autocomplete="new-password"
            :error-messages="$ta(store.inputErrors?.password)"
            :readonly="readonly"
        ></v-text-field>

        <RoleCombobox
            v-model="valueModel.role"
            :label="t('user.field.role')"
            :variant="variant"
            :rules="[(v:any) => !!v || t('validation.required')]"
            :error-messages="$ta(store.inputErrors?.role)"
            :readonly="readonly"
        ></RoleCombobox>

        <TenantCombobox
            v-if="isTenantEnabled && hasPermission('tenant:manage')"
            v-model="valueModel.tenant"
            :label="t('user.field.tenant')"
            :variant="variant"
            :error-messages="$ta(store.inputErrors?.tenant)"
            clearable
            :readonly="readonly"
        ></TenantCombobox>

        <v-text-field
            v-model="valueModel.email"
            :variant="variant"
            id="email-input"
            :label="t('user.field.email')"
            prepend-inner-icon="mdi-email"
            :rules="[(v:any) => !!v || t('validation.required')]"
            :error-messages="$ta(store.inputErrors?.email)"
            :readonly="readonly"
        ></v-text-field>

        <v-text-field
            v-model="valueModel.phone"
            :variant="variant"
            id="phone-input"
            :label="t('user.field.phone')"
            prepend-inner-icon="mdi-phone"
            :rules="[(v:any) => !!v || t('validation.required')]"
            :error-messages="$ta(store.inputErrors?.phone)"
            :readonly="readonly"
        ></v-text-field>

        <v-switch
            id="active-input"
            v-model="valueModel.active"
            color="primary"
            label="Active"
            :true-value="true"
            :false-value="false"
            :readonly="readonly"
        ></v-switch>

      </v-card-text>

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
