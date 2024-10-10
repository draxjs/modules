<script setup lang="ts">
import {computed} from "vue";
import type {PropType} from "vue";
import CrudFormList from "./CrudFormList.vue";
import CrudAutocomplete from "./CrudAutocomplete.vue";
import {useI18n} from "vue-i18n";
import {useCrudStore} from "../stores/UseCrudStore";
import {VDateInput} from 'vuetify/labs/VDateInput'
import type {IEntityCrud, IEntityCrudField, IEntityCrudFilter} from "@drax/crud-share";
const {t, te} = useI18n()

const store = useCrudStore()

const valueModel = defineModel<any>({type: [String, Number, Boolean, Object, Array], default: false})

const {index, entity, field, disableRules} = defineProps({
  entity: {type: Object as PropType<IEntityCrud>, required: true},
  field: {type: Object as PropType<IEntityCrudField|IEntityCrudFilter|undefined>, required: true},
  prependIcon: {type: String, default: ''},
  prependInnerIcon: {type: String, default: ''},
  appendIcon: {type: String, default: ''},
  appendInnerIcon: {type: String, default: ''},
  readonly: {type: Boolean, default: false},
  hideDetails: {type: Boolean, default: false},
  singleLine: {type: Boolean, default: false},
  clearable: {type: Boolean, default: false},
  disableRules: {type: Boolean, default: false},
  index: {type: Number, default: 0},
  density: {type: String as PropType<'comfortable' | 'compact' | 'default'>, default: 'default'},
  variant: {type: String as PropType<'underlined' | 'outlined' | 'filled' | 'solo' | 'solo-inverted' | 'solo-filled' | 'plain'>, default: 'filled'},
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
  if(disableRules) return undefined
  return entity.getRule(field.name) as any
})

const inputErrors = computed(() =>
    store.getInputErrors(field.name).map((error: string) => t(te(error) ? t(error) : error))
)

defineEmits(['updateValue'])

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
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hideDetails"
        :single-line="singleLine"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
        @update:modelValue="$emit('updateValue')"
    />

    <v-text-field
        v-if="field.type === 'number'"
        type="number"
        :name="name"
        :label="label"
        v-model="valueModel"
        :readonly="readonly"
        :error-messages="inputErrors"
        :rules="rules"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hideDetails"
        :single-line="singleLine"
        @update:modelValue="$emit('updateValue')"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
    />

    <v-switch
        v-if="field.type === 'boolean'"
        :name="name"
        :label="label"
        v-model="valueModel"
        :readonly="readonly"
        :error-messages="inputErrors"
        :rules="rules"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hideDetails"
        :single-line="singleLine"
        @update:modelValue="$emit('updateValue')"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
        color="primary"
    />


    <v-date-input
        v-if="field.type === 'date'"
        type="text"
        :name="name"
        :label="label"
        v-model="valueModel"
        :readonly="readonly"
        :error-messages="inputErrors"
        :rules="rules"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hideDetails"
        :single-line="singleLine"
        @update:modelValue="$emit('updateValue')"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
    />

    <crud-autocomplete
        v-if="field.type === 'ref'"
        :entity="entity.getRef(field.ref)"
        :field="field"
        v-model="valueModel"
        :label="label"
        :error-messages="inputErrors"
        :rules="rules"
        :density="density"
        :variant="variant"
        :readonly="readonly"
        :clearable="clearable"
        :hide-details="hideDetails"
        :single-line="singleLine"
        @updateValue="$emit('updateValue')"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
    />

    <v-card v-if="field.type === 'object'" class="mt-3" variant="flat" border>

      <v-card-title class="text-h5">{{ field.label }}</v-card-title>
      <v-card-text>
        <crud-form-field
            v-for="oField in field.objectFields"
            :entity="entity"
            :field="oField"
            v-model="valueModel[oField.name]"
            :density="density"
            :variant="variant"
            :clearable="clearable"
            :hide-details="hideDetails"
            :single-line="singleLine"
            @updateValue="$emit('updateValue')"
            :prepend-icon="prependIcon"
            :append-icon="appendIcon"
            :prepend-inner-icon="prependInnerIcon"
            :append-inner-icon="appendInnerIcon"
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
        :readonly="readonly"
        :error-messages="inputErrors"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hideDetails"
        :single-line="singleLine"
        :rules="rules"
        @update:modelValue="$emit('updateValue')"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
    >
    </v-combobox>


    <crud-autocomplete
        v-if="field.type === 'array.ref'"
        :entity="entity.getRef(field.ref)"
        :field="field"
        v-model="valueModel"
        :multiple="true"
        :chips="true"
        :label="label"
        :rules="rules"
        :error-messages="inputErrors"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hideDetails"
        :single-line="singleLine"
        @updateValue="$emit('updateValue')"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
    />


    <v-combobox
        v-if="field.type === 'array.number'"
        type="number"
        :name="name"
        :label="label"
        v-model="valueModel"
        :multiple="true"
        :chips="true"
        :readonly="readonly"
        :error-messages="inputErrors"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hideDetails"
        :single-line="singleLine"
        :rules="rules"
        @update:modelValue="$emit('updateValue')"
        :prepend-icon="prependIcon"
        :append-icon="appendIcon"
        :prepend-inner-icon="prependInnerIcon"
        :append-inner-icon="appendInnerIcon"
    >
    </v-combobox>


    <crud-form-list
        v-if="field.type === 'array.object'"
        :entity="entity"
        :field="field"
        v-model="valueModel"
        :readonly="readonly"
        :density="density"
        :variant="variant"
        :clearable="clearable"
        :hide-details="hideDetails"
        :single-line="singleLine"
        @updateValue="$emit('updateValue')"
    />

  </div>
</template>

<style scoped>

</style>
