<script setup lang="ts">
import {useFormUtils, useCrudStore} from "@drax/crud-vue";
import {defineEmits, defineModel, defineProps, ref} from "vue";
import {useI18nValidation} from "@drax/common-vue";
import PermissionSelector from "../components/PermissionSelector/PermissionSelector.vue";
import RoleCombobox from "../combobox/RoleCombobox.vue";

const {$ta} = useI18nValidation()
import {useI18n} from "vue-i18n";

const {t} = useI18n()

const valueModel = defineModel({type: [Object]})

defineProps({
  error: {type: String, required: false},
})

const emit = defineEmits(['submit', 'cancel'])

const store = useCrudStore()

const valid = ref()
const formRef = ref()

async function submit() {
  store.resetErrors()
  await formRef.value.validate()

  if(valid.value) {
    emit('submit',valueModel.value)
  }else{
    console.log('Invalid form')
  }
}

function cancel() {
  emit('cancel')
}

const  {
  variant, submitColor, readonly
} = useFormUtils(store.operation)

</script>

<template>
  <v-form v-model="valid" ref="formRef" @submit.prevent="submit">
    <v-text-field
        id="name-input"
        name="name"
        :label="$t('role.fields.name')"
        v-model="valueModel.name"
        prepend-inner-icon="mdi-card-account-details"
        :variant="variant"
        :error-messages="$ta(store.inputErrors?.name)"
        :rules="[v => !!v || 'validation.required']"
        density="default"
        :readonly="readonly"
        :clearable="false"
    ></v-text-field>

    <RoleCombobox
        v-model="valueModel.childRoles"
        :error-messages="$ta(store.inputErrors?.role)"
        multiple
        :readonly="readonly"
        :variant="variant"
    ></RoleCombobox>

    <PermissionSelector
        v-model="valueModel.permissions"
        :readonly="readonly"
    ></PermissionSelector>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn variant="text" color="grey" @click="cancel">{{ t('action.cancel') }}</v-btn>
      <v-btn variant="flat" v-if="store.operation != 'view'" :color="submitColor" @click="submit">
        {{ store.operation ? t('action.' + store.operation) : t('action.sent') }}
      </v-btn>
    </v-card-actions>

  </v-form>
</template>

<style scoped>

</style>
