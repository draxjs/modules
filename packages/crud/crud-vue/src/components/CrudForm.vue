<script setup lang="ts">
import type {PropType} from "vue";
import  {ref} from "vue";
import EntityCrud from "../EntityCrud";
import CrudFormField from "./CrudFormField.vue";
import type {TOperation} from "../interfaces/TOperation";


const valueModel = defineModel({type: [Object]})


const {entity} = defineProps({
  entity: {type: Object as PropType<EntityCrud>, required: true},
  operation: {type: String as PropType<TOperation>, required: true},
  readonly: {type: Boolean, default: false},
  error: {type: String, required: false},
})

const valid = ref()
const formRef = ref()

function submit() {
  formRef.value.validate()
  if(valid.value) {
    emit('submit',valueModel.value)
  }
}

function cancel() {
  emit('cancel')
}

const emit = defineEmits(['submit', 'cancel'])

</script>

<template>
  <v-form v-model="valid" ref="formRef"  @submit.prevent >
    <v-card flat>
      <v-card-text v-if="error">
        <v-alert color="error">{{ $te(error) ? $t(error) : error }}</v-alert>
      </v-card-text>
      <v-card-text>
        <template v-for="field in entity.fields" :key="field.name">
          <crud-form-field
              :field="field"
              :entity="entity"
              v-model="valueModel[field.name]"
          />
        </template>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" color="grey" @click="cancel">{{ $t('action.cancel') }}</v-btn>
        <v-btn variant="flat" color="primary" @click="submit">
          {{ operation ? $t('action.' + operation) : $t('action.sent') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<style scoped>

</style>
