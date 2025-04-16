<script setup lang="ts">
import {useI18n} from "vue-i18n";
import type {IEntityCrud, IEntityCrudField} from "@drax/crud-share";
import {useFormUtils} from "../composables/UseFormUtils";
import {getItemId} from "../helpers/getItemId";
import CrudFormField from "./CrudFormField.vue";
import {computed, defineEmits, defineModel, defineProps, ref} from "vue";
import type {PropType} from "vue";
import {useCrudStore} from "../stores/UseCrudStore";
import {useCrud} from "../composables/UseCrud";
import {useAuth} from '@drax/identity-vue'

const {hasPermission} = useAuth()
const {t, te} = useI18n()

const valueModel = defineModel({type: [Object]})

const {entity} = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
  readonly: {type: Boolean, default: false}
})

const {onSubmit, onCancel, operation, error} = useCrud(entity)

const emit = defineEmits(['created', 'updated', 'deleted', 'viewed', 'canceled'])

const store = useCrudStore()

const formRef = ref()

const fields = computed(() => {
  if (operation.value === 'create') {
    return entity.createFields
  } else if (operation.value === 'edit') {
    return entity.updateFields
  } else if (operation.value === 'delete') {
    return entity.deleteFields
  } else if (operation.value === 'view') {
    return entity.viewFields
  }
  return []
})


const aFields = computed(() => {
  return fields.value.filter((field: IEntityCrudField) => !field.permission || hasPermission(field.permission))
})

async function submit() {
  store.resetErrors()

  if (['create', 'edit'].includes(operation.value)) {
    const {valid, errors} = await formRef.value.validate()
    if (!valid) {
      console.log('Invalid form', errors)
      return
    }
  }

  let result = await onSubmit(valueModel.value)

  switch (result.status) {
    case "created":
      emit("created", result.item)
      break
    case "updated":
      emit("updated", result.item)
      break
    case "deleted":
      emit("deleted")
      break
    case "viewed":
      emit("viewed")
      break
  }

}

function cancel() {
  onCancel()
  emit('canceled')
}

const {
  variant, submitColor, readonly
} = useFormUtils(operation.value)


</script>

<template>
  <v-form ref="formRef" @submit.prevent>
    <v-card flat>

      <v-card-subtitle v-if="getItemId(valueModel)">ID: {{ getItemId(valueModel) }}</v-card-subtitle>

      <v-card-text v-if="error">
        <v-alert color="error">{{ te(error) ? t(error) : error }}</v-alert>
      </v-card-text>

      <v-card-text>
        <v-row>
          <v-col
              v-for="field in aFields"
              :key="field.name"
              :cols="field.cols ? field.cols : 12"
              :sm="field.sm ? field.sm : 12"
              :md="field.md ? field.md : 12"
              :lg="field.lg ? field.lg : 12"
              :xl="field.xl ? field.xl : 12"
          >
            <slot :name="`field.${field.name}`" v-bind="{field}">
              <crud-form-field
                  :field="field"
                  :entity="entity"
                  v-model="valueModel[field.name]"
                  :clearable="false"
                  :readonly="readonly || field.readonly"
                  :variant="variant"
                  :prepend-inner-icon="field?.prependInnerIcon"
                  :prepend-icon="field?.prependIcon"
                  :append-icon="field?.appendIcon"
                  :append-inner-icon="field?.appendInnerIcon"
              />
            </slot>

          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" color="grey" @click="cancel">
          {{ operation == 'view' ? t('action.close') : t('action.cancel') }}
        </v-btn>
        <v-btn variant="flat" v-if="operation != 'view'" :color="submitColor" @click="submit" :loading="store.loading">
          {{ operation ? t('action.' + operation) : t('action.sent') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<style scoped>

</style>
