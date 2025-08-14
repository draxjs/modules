<script setup lang="ts">
import {useFormUtils, useCrudStore} from "@drax/crud-vue";
import {defineEmits, defineModel, ref} from "vue";
import {useI18nValidation} from "@drax/common-vue";
import PermissionSelector from "../../components/PermissionSelector/PermissionSelector.vue";
import RoleCombobox from "../../combobox/RoleCombobox.vue";
import {useI18n} from "vue-i18n";

const {$ta} = useI18nValidation()
const {t, te} = useI18n()

const valueModel = defineModel({type: [Object]})

const emit = defineEmits(['submit', 'cancel'])

const store = useCrudStore()

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
  variant, submitColor, readonly
} = useFormUtils(store.operation)

</script>

<template>


  <v-form v-model="valid" ref="formRef" @submit.prevent="submit">
    <v-card flat>
      <v-alert v-if="valueModel.readonly && store.operation != 'view'" type="warning">
        {{ t('role.readonly') }}
      </v-alert>

      <template v-if="!valueModel.readonly || store.operation == 'view'">


        <v-card-subtitle v-if="valueModel.id">ID: {{ valueModel.id }}</v-card-subtitle>

        <v-card-text v-if="store.error">
          <v-alert color="error">{{ te(store.error) ? t(store.error) : store.error }}</v-alert>
        </v-card-text>

        <v-card-text>

          <v-text-field
              id="name-input"
              name="name"
              :label="t('role.field.name')"
              v-model="valueModel.name"
              prepend-inner-icon="mdi-card-account-details"
              :variant="variant"
              :error-messages="$ta(store.inputErrors?.name)"
              :rules="[v => !!v || t('validation.required')]"
              density="default"
              :readonly="readonly"
              :clearable="false"
          ></v-text-field>

          <RoleCombobox
              v-model="valueModel.childRoles"
              label="role.field.childRoles"
              :error-messages="$ta(store.inputErrors?.role)"
              multiple
              :readonly="readonly"
              :variant="variant"
          ></RoleCombobox>

          <PermissionSelector
              v-model="valueModel.permissions"
              :readonly="readonly"
          ></PermissionSelector>

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
