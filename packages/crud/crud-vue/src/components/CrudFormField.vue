<script setup lang="ts">
import {computed} from "vue";
import type {PropType} from "vue";
import CrudFormList from "./CrudFormList.vue";
import CrudAutocomplete from "./CrudAutocomplete.vue";
import {useI18n} from "vue-i18n";
import {useCrudStore} from "../stores/UseCrudStore";
import {VDateInput} from 'vuetify/labs/VDateInput'
import type {IEntityCrud, IEntityCrudField} from "@drax/crud-share";
const {t, te} = useI18n()

const store = useCrudStore()

const valueModel = defineModel<any>({type: [String, Number, Boolean, Object, Array], default: false})

const {index, entity, field} = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
  field: {type: Object as PropType<IEntityCrudField|undefined>, required: true},
  readonly: {type: Boolean, default: false},
  index: {type: Number, default: 0},
})

if(!field){
  throw new Error("CrudFormField must be provided with a field object")
}

const name = computed(() => index > 0 ? `${field.name}_${index}` : field.name)

const label = computed(() => {
  const i18n = `${entity.name}.fields.${field.name}`
  return te(i18n) ? t(i18n) : field.label
})

const rules = computed(() => {
  return entity.getRule(field.name) as any
})

const inputErrors = computed(() =>
    store.getInputErrors(field.name).map((error: string) => t(te(error) ? t(error) : error))
)

</script>

<template>

  <div v-if="field && field.type">
    <v-text-field
        v-if="field.type === 'string'"
        type="text"
        :name="name"
        :label="label"
        v-model="valueModel"
        :readonly="readonly"
        :error-messages="inputErrors"
        :rules="rules"
    >
    </v-text-field>

    <v-text-field
        v-if="field.type === 'number'"
        type="number"
        :name="name"
        :label="label"
        v-model="valueModel"
        :readonly="readonly"
        :error-messages="inputErrors"
        :rules="rules"
    >
    </v-text-field>

    <v-checkbox
        v-if="field.type === 'boolean'"
        :name="name"
        :label="label"
        v-model="valueModel"
        :readonly="readonly"
        :error-messages="inputErrors"
        :rules="rules"
    >
    </v-checkbox>


    <v-date-input
        v-if="field.type === 'date'"
        type="text"
        :name="name"
        :label="label"
        v-model="valueModel"
        :readonly="readonly"
        :error-messages="inputErrors"
        prepend-inner-icon="mdi-calendar"
        prepend-icon=""
        :rules="rules"
    />

    <crud-autocomplete
        v-if="field.type === 'ref'"
        :entity="entity.getRef(field.ref)"
        :field="field"
        v-model="valueModel"
        :label="label"
        :error-messages="inputErrors"
        :rules="rules"
    />

    <v-card v-if="field.type === 'object'" class="mt-3" variant="flat" border>

      <v-card-title class="text-h5">{{ field.label }}</v-card-title>
      <v-card-text>
        <crud-form-field
            v-for="oField in field.objectFields"
            :entity="entity"
            :field="oField"
            v-model="valueModel[oField.name]"
        ></crud-form-field>
      </v-card-text>

    </v-card>

    <v-combobox
        v-if="field.type === 'array.string'"
        type="text"
        :name="name"
        :label="label"
        v-model="valueModel"
        :multiple="true"
        :chips="true"
        :closable-chips="true"
        :clearable="true"
        :readonly="readonly"
        :error-messages="inputErrors"
    >
    </v-combobox>


    <crud-autocomplete
        v-if="field.type === 'array.ref'"
        :entity="entity.getRef(field.ref)"
        :field="field"
        v-model="valueModel"
        :multiple="true"
        :chips="true"
        :clearable="true"
        :label="label"
        :error-messages="inputErrors"
    />


    <v-combobox
        v-if="field.type === 'array.number'"
        type="number"
        :name="name"
        :label="label"
        v-model="valueModel"
        :multiple="true"
        :chips="true"
        :clearable="true"
        :readonly="readonly"
        :error-messages="inputErrors"
    >
    </v-combobox>


    <crud-form-list
        v-if="field.type === 'array.object'"
        :entity="entity"
        :field="field"
        v-model="valueModel"
        :readonly="readonly"
    />

  </div>
</template>

<style scoped>

</style>
